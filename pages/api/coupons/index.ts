import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import {jwtVerify} from "jose";
import { useAuth } from '@/hooks/useAuth';

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const verified = await useAuth(req, res);
    if (!verified || verified.payload.roleName !== 'admin') {
        return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
            data: null,
            message: 'Unauthorized',
            statusCode: StatusCode.UNAUTHORIZED
        }));
}
    if (req.method === 'GET') {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;
            const search = req.query.search as string;
            const status = req.query.status as string;

            let query = db('coupons').whereNot('status', -2);

            if (search) {
                query = query.where('code', 'ilike', `%${search}%`);
            }

            if (status) {
                query = query.where('status', status);
            }

            const [count] = await query.clone().count('* as total');
            const totalItems = count.total as number;

            const coupons = await query
                .select('*')
                .orderBy('created_at', 'desc')
                .offset(offset)
                .limit(limit)
                .orderBy('created_at', 'desc');

            const totalPages = Math.ceil(totalItems / limit);

            res.status(StatusCode.OK).json(transformResponse({
                data: coupons,
                message: 'Coupons retrieved successfully.',
                statusCode: StatusCode.OK,
                pagination: {
                    currentPage: page,
                    pageSize: limit,
                    totalItems,
                    totalPages,
                },
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving coupons.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'POST') {
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
                    message: 'Code, discount type and discount value are required fields.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (!['percentage', 'fixed_amount'].includes(discount_type)) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Invalid discount type. Must be either "percentage" or "fixed_amount".',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const existingCoupon = await db('coupons')
                .where({ code })
                .first();

            if (existingCoupon) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'A coupon with this code already exists.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const [newCoupon] = await db('coupons').insert({
                code,
                discount_type,
                discount_value,
                start_date: start_date || null,
                end_date: end_date || null,
                min_purchase_amount: min_purchase_amount || null,
                max_usage: 1,
                max_discount_value: max_discount_value || null,
                is_active: is_active ?? true,
                status: 1,
                created_at: db.fn.now(),
                updated_at: db.fn.now()
            }).returning('*');

            res.status(StatusCode.CREATED).json(transformResponse({
                data: newCoupon,
                message: 'Coupon created successfully.',
                statusCode: StatusCode.CREATED,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while creating the coupon.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
