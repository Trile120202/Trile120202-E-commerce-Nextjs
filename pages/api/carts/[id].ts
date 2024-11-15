import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import { jwtVerify } from "jose";
import { useAuth } from '@/hooks/useAuth';

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const verified = await useAuth(req, res);
    if (!verified || 'payload' in verified === false) {
        return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
            data: null,
            message: 'Unauthorized',
            statusCode: StatusCode.UNAUTHORIZED
        }));
    }
    const userId = verified.payload.userId;
    const { id } = req.query;

    try {
        if (req.method === 'GET') {
            const cart = await db('carts as c')
                .leftJoin('cart_items as ci', 'c.id', 'ci.cart_id')
                .leftJoin('products as p', 'ci.product_id', 'p.id')
                .leftJoin('images as i', 'p.thumbnail_id', 'i.id')
                .where('c.id', id)
                .where('c.user_id', userId as string)
                .where('c.status', 1)
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
                    db.raw('SUM(p.price * ci.quantity) as total_amount'),
                    db.raw('SUM(ci.quantity) as total_items')
                )
                .groupBy('c.id');

            if (!cart || cart.length === 0) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Cart not found',
                    statusCode: StatusCode.NOT_FOUND
                }));
            }

            return res.status(StatusCode.OK).json(transformResponse({
                data: cart[0],
                message: 'Cart retrieved successfully',
                statusCode: StatusCode.OK
            }));

        } else if (req.method === 'POST') {
            const { product_id, quantity } = req.body;

            if (!product_id || !quantity) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Product ID and quantity are required',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            const product = await db('products')
                .where('id', product_id)
                .where('stock', '>=', quantity)
                .first();

            if (!product) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Product not available in requested quantity',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            const existingItem = await db('cart_items')
                .where({
                    cart_id: id,
                    product_id: product_id
                })
                .first();

            if (existingItem) {
                await db('cart_items')
                    .where('id', existingItem.id)
                    .update({
                        quantity: existingItem.quantity + quantity,
                        updated_at: db.fn.now()
                    });
            } else {
                await db('cart_items').insert({
                    cart_id: id,
                    product_id: product_id,
                    quantity: quantity,
                    created_at: db.fn.now(),
                    updated_at: db.fn.now()
                });
            }

            const updatedCart = await getCartWithTotals(id as string, userId as string);
            return res.status(StatusCode.OK).json(transformResponse({
                data: updatedCart,
                message: 'Product added to cart successfully',
                statusCode: StatusCode.OK
            }));

        } else if (req.method === 'PUT') {
            const { product_id, quantity } = req.body;

            if (!product_id || !quantity) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Product ID and quantity are required',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            const cartItem = await db('cart_items')
                .where({
                    cart_id: id,
                    product_id: product_id
                })
                .first();

            if (!cartItem) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Product not found in cart',
                    statusCode: StatusCode.NOT_FOUND
                }));
            }

            const product = await db('products')
                .where('id', product_id)
                .where('stock', '>=', quantity)
                .first();

            if (!product) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Product not available in requested quantity',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            await db('cart_items')
                .where({
                    cart_id: id,
                    product_id: product_id
                })
                .update({
                    quantity: quantity,
                    updated_at: db.fn.now()
                });

            const updatedCart = await getCartWithTotals(id as string, userId as string);
            return res.status(StatusCode.OK).json(transformResponse({
                data: updatedCart,
                message: 'Cart updated successfully',
                statusCode: StatusCode.OK
            }));

        }
    } catch (error) {
        console.error('Error processing cart operation:', error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
            data: null,
            message: 'An error occurred while processing the cart operation',
            statusCode: StatusCode.INTERNAL_SERVER_ERROR
        }));
    }
}

async function getCartWithTotals(cartId: string | string[], userId: unknown) {
    return db('carts as c')
        .leftJoin('cart_items as ci', 'c.id', 'ci.cart_id')
        .leftJoin('products as p', 'ci.product_id', 'p.id')
        .leftJoin('images as i', 'p.thumbnail_id', 'i.id')
        .where('c.id', cartId)
        .where('c.user_id', userId as string)
        .where('c.status', 1)
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
            db.raw('SUM(p.price * ci.quantity) as total_amount'),
            db.raw('SUM(ci.quantity) as total_items')
        )
        .groupBy('c.id')
        .first();
}
