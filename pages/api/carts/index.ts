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

            const cart = await db('carts as c')
                .leftJoin('cart_items as ci', 'c.id', 'ci.cart_id')
                .leftJoin('products as p', 'ci.product_id', 'p.id')
                .leftJoin('images as i', 'p.thumbnail_id', 'i.id')
                .where('c.user_id', userId as string)
                .where('c.status', 1)
                .where('ci.status',1)
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
                    'i.url as thumbnail_url'
                )
                .orderBy('ci.created_at', 'desc');

            return res.status(StatusCode.OK).json(transformResponse({
                data: cart,
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
