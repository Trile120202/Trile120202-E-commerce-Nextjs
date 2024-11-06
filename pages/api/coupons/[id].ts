import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const coupon = await db('coupons')
                .where('id', id)
                .first();

            if (!coupon) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Coupon not found.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            res.status(StatusCode.OK).json(transformResponse({
                data: coupon,
                message: 'Coupon retrieved successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving the coupon.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'PUT') {
        try {
            const {
                code,
                discount_type,
                discount_value,
                start_date,
                end_date,
                min_purchase_amount,
                max_usage,
                max_discount_value,
                is_active
            } = req.body;

            if (!code || !discount_type || !discount_value) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Missing required fields.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (!['percentage', 'fixed_amount'].includes(discount_type)) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Invalid discount type.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const existingCoupon = await db('coupons')
                .where('code', code)
                .whereNot('id', id)
                .first();

            if (existingCoupon) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Coupon code already exists.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const [updatedCoupon] = await db('coupons')
                .where({ id })
                .update({
                    code,
                    discount_type,
                    discount_value,
                    start_date,
                    end_date,
                    min_purchase_amount,
                    max_usage,
                    max_discount_value,
                    is_active,
                    updated_at: db.fn.now(),
                })
                .returning('*');

            if (!updatedCoupon) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Coupon not found.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            return res.status(StatusCode.OK).json(transformResponse({
                data: updatedCoupon,
                message: 'Coupon updated successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error('Error updating coupon:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while updating the coupon.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
