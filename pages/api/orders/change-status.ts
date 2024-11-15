import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import {jwtVerify} from "jose";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
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

            if (!token && verified.payload.roleName !== "admin") {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'Unauthorized - Invalid permissions',
                    statusCode: StatusCode.UNAUTHORIZED
                }));
            }

            const { orderId, status } = req.body;

            if (!orderId || typeof status !== 'number' || ![1,2,3,4,5,6,7,8,9].includes(status)) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'ID đơn hàng và trạng thái không hợp lệ.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const [updatedOrder] = await db('orders')
                .where({ id: orderId })
                .update({ 
                    status,
                    updated_at: db.fn.now()
                })
                .returning('*');

            if (!updatedOrder) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Không tìm thấy đơn hàng.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            return res.status(StatusCode.OK).json(transformResponse({
                data: updatedOrder,
                message: 'Cập nhật trạng thái đơn hàng thành công.',
                statusCode: StatusCode.OK,
            }));

        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    }

    res.setHeader('Allow', ['PUT']);
    return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
        data: null,
        message: `Phương thức ${req.method} không được hỗ trợ.`,
        statusCode: StatusCode.METHOD_NOT_ALLOWED,
    }));
}
