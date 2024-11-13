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
                token,
                new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
            );

            const { page = 1, limit = 10, status = 'all', search = '' } = req.query;
            const offset = (Number(page) - 1) * Number(limit);

            let query = db
                .select(
                    'orders.*',
                    'users.username as customer_name',
                    'users.full_name as full_name',
                    'users.email as customer_email',
                    'payment_methods.name as payment_method_name',
                    'payment_methods.icon_url as payment_method_icon',
                    'delivery_addresses.address',
                    'delivery_addresses.phone_number',
                    'provinces.name as province_name',
                    'districts.name as district_name',
                    'wards.name as ward_name'
                )
                .from('orders')
                .leftJoin('users', 'orders.user_id', 'users.id')
                .leftJoin('payment_methods', 'orders.payment_method_id', 'payment_methods.id')
                .leftJoin('delivery_addresses', 'orders.delivery_address_id', 'delivery_addresses.id')
                .leftJoin('provinces', 'delivery_addresses.province_code', 'provinces.code')
                .leftJoin('districts', 'delivery_addresses.district_code', 'districts.code')
                .leftJoin('wards', 'delivery_addresses.ward_code', 'wards.code')
                .orderBy('orders.created_at', 'desc');

            if (status !== 'all') {
                query = query.where('orders.status', status);
            }

            if (search) {
                query = query.where(function() {
                    this.where('users.username', 'ilike', `%${search}%`)
                        .orWhere('users.email', 'ilike', `%${search}%`)
                        .orWhere('delivery_addresses.phone_number', 'ilike', `%${search}%`);
                });
            }

            const countQuery = db('orders')
                .count('* as count')
                .leftJoin('users', 'orders.user_id', 'users.id')
                .leftJoin('delivery_addresses', 'orders.delivery_address_id', 'delivery_addresses.id');

            if (status !== 'all') {
                countQuery.where('orders.status', status);
            }

            if (search) {
                countQuery.where(function() {
                    this.where('users.username', 'ilike', `%${search}%`)
                        .orWhere('users.email', 'ilike', `%${search}%`)
                        .orWhere('delivery_addresses.phone_number', 'ilike', `%${search}%`);
                });
            }

            const countResult = await countQuery.first();
            const total = Number(countResult?.count || 0);

            query = query.limit(Number(limit)).offset(offset);
            const orders = await query;

            for (let order of orders) {
                const items = await db
                    .select(
                        'order_items.*',
                        'products.name as product_name',
                        'products.slug',
                        'products.price as product_price',
                        'images.url as product_image'
                    )
                    .from('order_items')
                    .leftJoin('products', 'order_items.product_id', 'products.id')
                    .leftJoin('images', 'products.thumbnail_id', 'images.id')
                    .where('order_items.order_id', order.id);

                order.items = items;
            }

            const totalPages = Math.ceil(total / Number(limit));

            return res.status(StatusCode.OK).json(transformResponse({
                data: orders,
                pagination: {
                    currentPage: Number(page),
                    pageSize: Number(limit),
                    totalItems: total,
                    totalPages
                },
                message: 'Orders retrieved successfully',
                statusCode: StatusCode.OK
            }));

        } catch (error) {
            console.error('Error fetching orders:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Internal server error',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR
            }));
        }
    } else {
        return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
            data: null,
            message: 'Method not allowed',
            statusCode: StatusCode.METHOD_NOT_ALLOWED
        }));
    }
}
