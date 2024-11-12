import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import { jwtVerify } from "jose";

const db = knex(knexConfig);

const CANCELABLE_STATUSES = [1, 2]; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        res.setHeader('Allow', ['PUT']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
            data: null,
            message: `Method ${req.method} Not Allowed`,
            statusCode: StatusCode.METHOD_NOT_ALLOWED
        }));
    }

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
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                data: null,
                message: 'Order ID is required',
                statusCode: StatusCode.BAD_REQUEST
            }));
        }

        const order = await db('orders')
            .where({
                id: orderId,
                user_id: userId
            })
            .first();

        if (!order) {
            return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                data: null,
                message: 'Order not found',
                statusCode: StatusCode.NOT_FOUND
            }));
        }

        if (!CANCELABLE_STATUSES.includes(order.status)) {
            return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                data: null,
                message: 'Cannot cancel order in current status',
                statusCode: StatusCode.BAD_REQUEST
            }));
        }

        await db.transaction(async trx => {
            await trx('orders')
                .where('id', orderId)
                .update({
                    status: 5, 
                    updated_at: trx.fn.now()
                });

            const orderItems = await trx('order_items')
                .where('order_id', orderId);

            for (const item of orderItems) {
                await trx('products')
                    .where('id', item.product_id)
                    .increment('stock_quantity', item.quantity);
            }
        });

        return res.status(StatusCode.OK).json(transformResponse({
            data: null,
            message: 'Order cancelled successfully',
            statusCode: StatusCode.OK
        }));

    } catch (error) {
        console.error('Error cancelling order:', error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
            data: null,
            message: 'An error occurred while cancelling the order',
            statusCode: StatusCode.INTERNAL_SERVER_ERROR
        }));
    }
}
