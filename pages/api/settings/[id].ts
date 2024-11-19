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
            const { id } = req.query;

            const setting = await db('settings')
                .where({ name:id, status: 1 })
                .first();

            if (!setting) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Không tìm thấy cài đặt.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            return res.status(StatusCode.OK).json(transformResponse({
                data: setting,
                message: 'Lấy thông tin cài đặt thành công.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error('Lỗi khi lấy thông tin cài đặt:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi lấy thông tin cài đặt.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'DELETE') {
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

            if (!verified.payload.roleId || verified.payload.roleName !== "admin") {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'Unauthorized - Invalid role',
                    statusCode: StatusCode.UNAUTHORIZED
                }));
            }

            const { id } = req.query;

            const [deletedSetting] = await db('settings')
                .where({ id })
                .update({ status: -2 })
                .returning('*');

            if (!deletedSetting) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Không tìm thấy cài đặt.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            return res.status(StatusCode.OK).json(transformResponse({
                data: deletedSetting,
                message: 'Xóa cài đặt thành công.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error('Lỗi khi xóa cài đặt:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi xóa cài đặt.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'DELETE']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
            data: null,
            message: `Phương thức ${req.method} không được hỗ trợ.`,
            statusCode: StatusCode.METHOD_NOT_ALLOWED,
        }));
    }
}
