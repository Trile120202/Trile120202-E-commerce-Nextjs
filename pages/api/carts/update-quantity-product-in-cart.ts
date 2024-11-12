import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import { jwtVerify } from "jose";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
            data: null,
            message: 'Method not allowed',
            statusCode: StatusCode.METHOD_NOT_ALLOWED
        }));
    }

    const token = req.cookies.token;
    if (!token) {
        return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
            data: null,
            message: 'Unauthorized - No token provided',
            statusCode: StatusCode.UNAUTHORIZED
        }));
    }

    try {
        const verified = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
        );
        const userId = verified.payload.userId;
        const { id } = req.query;
        const { product_id, cart_item_id, quantity } = req.body;

        if (!product_id || !cart_item_id || !quantity) {
            return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                data: null,
                message: 'Product ID, cart item ID and quantity are required',
                statusCode: StatusCode.BAD_REQUEST
            }));
        }

        const cartItem = await db('cart_items as ci')
            .join('carts as c', 'ci.cart_id', 'c.id')
            .where({
                'ci.id': cart_item_id,
                'ci.cart_id': id,
                'ci.product_id': product_id,
                'c.user_id': userId,
                'c.status': 1,
                'ci.status': 1
            })
            .first();

        if (!cartItem) {
            return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                data: null,
                message: 'Product not found in cart',
                statusCode: StatusCode.NOT_FOUND
            }));
        }

        await db('cart_items')
            .where({
                id: cart_item_id,
                cart_id: id,
                product_id: product_id
            })
            .update({
                quantity: quantity,
                updated_at: db.fn.now()
            });

        return res.status(StatusCode.OK).json(transformResponse({
            data: [],
            message: 'Product quantity updated successfully',
            statusCode: StatusCode.OK
        }));

    } catch (error) {
        console.error('Error updating product quantity:', error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
            data: null,
            message: 'Internal server error',
            statusCode: StatusCode.INTERNAL_SERVER_ERROR
        }));
    }
}
