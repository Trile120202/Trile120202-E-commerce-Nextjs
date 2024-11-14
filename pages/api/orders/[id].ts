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

            const { id } = req.query;

            const order = await db('orders')
                .select(
                    'orders.*',
                    'users.full_name',
                    'users.email as customer_email',
                    'payment_methods.name as payment_method_name',
                    'payment_methods.icon_url as payment_method_icon',
                    'delivery_addresses.address',
                    'delivery_addresses.phone_number',
                    'provinces.name as province_name',
                    'districts.name as district_name',
                    'wards.name as ward_name'
                )
                .leftJoin('users', 'orders.user_id', 'users.id')
                .leftJoin('payment_methods', 'orders.payment_method_id', 'payment_methods.id')
                .leftJoin('delivery_addresses', 'orders.delivery_address_id', 'delivery_addresses.id')
                .leftJoin('provinces', 'delivery_addresses.province_code', 'provinces.code')
                .leftJoin('districts', 'delivery_addresses.district_code', 'districts.code')
                .leftJoin('wards', 'delivery_addresses.ward_code', 'wards.code')
                .where('orders.id', id)
                .first();

            if (!order) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Không tìm thấy đơn hàng.',
                    statusCode: StatusCode.NOT_FOUND
                }));
            }

            const orderItems = await db('order_items')
                .select(
                    'order_items.*',
                    'products.name as product_name',
                    'images.url as product_image',
                    'products.slug'
                )
                .leftJoin('products', 'order_items.product_id', 'products.id')
                .leftJoin('images', 'products.thumbnail_id', 'images.id')
                .where('order_items.order_id', id);

            order.items = orderItems;

            return res.status(StatusCode.OK).json(transformResponse({
                data: order,
                message: 'Lấy thông tin đơn hàng thành công.',
                statusCode: StatusCode.OK
            }));

        } catch (error) {
            console.error('Lỗi khi lấy thông tin đơn hàng:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi lấy thông tin đơn hàng.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR
            }));
        }
    }

    res.setHeader('Allow', ['GET']);
    return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
        data: null,
        message: `Phương thức ${req.method} không được hỗ trợ.`,
        statusCode: StatusCode.METHOD_NOT_ALLOWED
    }));
}
