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

            const orders = await db('orders')
                .select(
                    'orders.*',
                    db.raw('json_agg(json_build_object(' +
                        "'product_id', products.id, " +
                        "'product_name', products.name, " +
                        "'quantity', order_items.quantity, " +
                        "'price', products.price, " +
                        "'thumbnail_url', products.thumbnail_url" +
                        ')) as items')
                )
                .leftJoin('order_items', 'orders.id', 'order_items.order_id')
                .leftJoin('products', 'order_items.product_id', 'products.id')
                .where('orders.user_id', userId)
                .groupBy('orders.id')
                .orderBy('orders.created_at', 'desc');

            res.status(StatusCode.OK).json(transformResponse({
                data: orders,
                message: 'Orders retrieved successfully.',
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
            const { items, shipping_address, payment_method, total_amount } = req.body;

            if (!shipping_address) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Shipping address is required',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            if (!payment_method) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Payment method is required',
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

            const [newOrder] = await db('orders').insert({
                user_id: userId,
                total_amount,
                status: 1,
                shipping_address,
                payment_method,
                created_at: db.fn.now(),
                updated_at: db.fn.now()
            }).returning('*');

            const orderItems = items.map(item => ({
                order_id: newOrder.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                status: 1,
                created_at: db.fn.now(),
                updated_at: db.fn.now()
            }));

            await db('order_items').insert(orderItems);

            res.status(StatusCode.CREATED).json(transformResponse({
                data: newOrder,
                message: 'Order created successfully',
                statusCode: StatusCode.CREATED
            }));
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
