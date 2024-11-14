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

            // Get the cart and check the status of products
            const cart = await db('carts as c')
                .leftJoin('cart_items as ci', 'c.id', 'ci.cart_id')
                .leftJoin('products as p', 'ci.product_id', 'p.id')
                .leftJoin('images as i', 'p.thumbnail_id', 'i.id')
                .where('c.user_id', userId as string)
                .where('c.status', 1)
                .where('ci.status', 1)
                .select(
                    'c.id as cart_id',
                    'c.user_id',
                    'c.created_at',
                    'c.updated_at',
                    'ci.id as cart_item_id',
                    'ci.quantity',
                    'p.id as product_id',
                    'p.name as product_name',
                    'p.price',
                    'p.slug',
                    'i.url as thumbnail_url',
                    'p.status as product_status'  // Add product status to check
                )
                .orderBy('ci.created_at', 'desc');

            // Filter out items where product status is not 1, and remove those from the cart
            const validCartItems = cart.filter(item => item.product_status === 1);

            // If there are invalid cart items (product status !== 1), remove them from cart_items
            if (validCartItems.length !== cart.length) {
                // Identify cart items with invalid product statuses
                const invalidCartItems = cart.filter(item => item.product_status !== 1);
                const invalidCartItemIds = invalidCartItems.map(item => item.cart_item_id);

                // Remove invalid items from the cart_items table
                await db('cart_items')
                    .whereIn('id', invalidCartItemIds)
                    .update({ status: 0, updated_at: db.fn.now() });  // Soft delete (mark as inactive)
            }

            return res.status(StatusCode.OK).json(transformResponse({
                data: validCartItems,  // Return valid cart items
                message: 'Cart retrieved successfully',
                statusCode: StatusCode.OK
            }));

        } catch (error) {
            console.error('Error retrieving cart:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving the cart',
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
            const { product_id, quantity } = req.body;

            if (!product_id || !quantity) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Product ID and quantity are required',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            const trx = await db.transaction();

            try {
                let cart = await trx('carts')
                    .where({ user_id: userId, status: 1 })
                    .first();

                if (!cart) {
                    [cart] = await trx('carts')
                        .insert({
                            user_id: userId,
                            status: 1
                        })
                        .returning('*');
                }

                const existingItem = await trx('cart_items')
                    .where({
                        cart_id: cart.id,
                        product_id: product_id,
                        status: 1
                    })
                    .first();

                if (existingItem) {
                    await trx('cart_items')
                        .where('id', existingItem.id)
                        .update({
                            quantity: existingItem.quantity + quantity,
                            updated_at: db.fn.now()
                        });
                } else {
                    await trx('cart_items')
                        .insert({
                            cart_id: cart.id,
                            product_id: product_id,
                            quantity: quantity
                        });
                }

                await trx.commit();

                return res.status(StatusCode.CREATED).json(transformResponse({
                    data: cart,
                    message: 'Item added to cart successfully',
                    statusCode: StatusCode.CREATED
                }));

            } catch (error) {
                await trx.rollback();
                throw error;
            }

        } catch (error) {
            console.error('Error adding item to cart:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while adding item to cart',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
