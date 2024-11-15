import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import { jwtVerify } from "jose";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'Unauthorized - No token provided',
                    statusCode: StatusCode.UNAUTHORIZED
                }));
            }

            const verified = await jwtVerify(
                token as string,
                new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
            );

            const userId = verified.payload.userId;

            const orders = await db
                .select(
                    'orders.*',
                    'payment_methods.name as payment_method_name', 
                    'payment_methods.icon_url as payment_method_icon',
                    'delivery_addresses.address as delivery_address',
                    'delivery_addresses.phone_number as delivery_phone',
                    'provinces.name as province_name',
                    'districts.name as district_name',
                    'wards.name as ward_name',
                    db.raw('COALESCE(SUM(order_items.quantity), 0) as total_items')
                )
                .from('orders')
                .leftJoin('payment_methods', 'orders.payment_method_id', 'payment_methods.id')
                .leftJoin('delivery_addresses', 'orders.delivery_address_id', 'delivery_addresses.id')
                .leftJoin('provinces', 'delivery_addresses.province_code', 'provinces.code')
                .leftJoin('districts', 'delivery_addresses.district_code', 'districts.code')
                .leftJoin('wards', 'delivery_addresses.ward_code', 'wards.code')
                .leftJoin('order_items', 'orders.id', 'order_items.order_id')
                .where('orders.user_id', userId as string)
                .groupBy('orders.id', 
                    'payment_methods.name',
                    'payment_methods.icon_url',
                    'delivery_addresses.address',
                    'delivery_addresses.phone_number', 
                    'provinces.name',
                    'districts.name',
                    'wards.name')
                .orderBy('orders.created_at', 'desc');

            for (let order of orders) {
                const items = await db
                    .select(
                        'order_items.*',
                        'products.name as product_name',
                        'products.description',
                        'products.slug',
                        'products.price',
                        'products.specifications',
                        'products.stock_quantity',
                        'images.url as thumbnail_url',
                        'images.alt_text',
                        'categories.id as category_id',
                        'categories.name as category_name',
                        'categories.slug as category_slug'
                    )
                    .from('order_items')
                    .leftJoin('products', 'order_items.product_id', 'products.id')
                    .leftJoin('images', 'products.thumbnail_id', 'images.id')
                    .leftJoin('product_categories', 'products.id', 'product_categories.product_id')
                    .leftJoin('categories', 'product_categories.category_id', 'categories.id')
                    .where('order_items.order_id', order.id);

                order.items = items;
            }

            return res.status(StatusCode.OK).json(transformResponse({
                data: orders,
                message: 'Orders retrieved successfully',
                statusCode: StatusCode.OK
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving orders.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR
            }));
        }
    } else if (req.method === 'POST') {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'Unauthorized - No token provided',
                    statusCode: StatusCode.UNAUTHORIZED
                }));
            }

            const verified = await jwtVerify(
                token as string,
                new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
            );

            const userId = verified.payload.userId;
            const { items, shipping_address, payment_method_id, total_amount, delivery_address_id, note } = req.body;

            if (!shipping_address) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Shipping address is required',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            if (!payment_method_id) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Payment method is required',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            if (!delivery_address_id) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Delivery address is required',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Order must contain at least one item',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            for (const item of items) {
                const product = await db('products')
                    .where('id', item.product_id)
                    .first();

                if (!product) {
                    return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                        data: null,
                        message: `Product with ID ${item.product_id} not found`,
                        statusCode: StatusCode.BAD_REQUEST
                    }));
                }

                if (product.stock_quantity < item.quantity) {
                    return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                        data: null,
                        message: `Sản phẩm "${product.name}" chỉ còn ${product.stock_quantity} sản phẩm trong kho`,
                        statusCode: StatusCode.BAD_REQUEST
                    }));
                }
            }

            await db.transaction(async trx => {
                const [newOrder] = await trx('orders').insert({
                    user_id: userId,
                    total_amount,
                    status: 1,
                    shipping_address,
                    payment_method_id,
                    delivery_address_id,
                    note,
                    order_date: trx.fn.now(),
                    created_at: trx.fn.now(),
                    updated_at: trx.fn.now()
                }).returning('*');

                const orderItems = items.map(item => ({
                    order_id: newOrder.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                    status: 1,
                    created_at: trx.fn.now(),
                    updated_at: trx.fn.now()
                }));

                await trx('order_items').insert(orderItems);

                const [cart] = await trx('carts')
                    .where('user_id', userId as number)
                    .where('status', 1);

                if (cart) {
                    await trx('cart_items')
                        .where('cart_id', cart.id)
                        .whereIn('product_id', items.map(item => item.product_id))
                        .delete();
                }

                for (const item of items) {
                    await trx('products')
                        .where('id', item.product_id)
                        .decrement('stock_quantity', item.quantity);
                }

                res.status(StatusCode.CREATED).json(transformResponse({
                    data: newOrder,
                    message: 'Order created successfully',
                    statusCode: StatusCode.CREATED
                }));
            });

        } catch (error) {
            console.error('Error creating order:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while creating the order',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
