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
            const settings = await db('settings')
                .where('status', '!=', -2)
                .orderBy('created_at', 'desc');

            return res.status(StatusCode.OK).json(transformResponse({
                data: settings,
                message: 'Lấy danh sách cài đặt thành công.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error('Lỗi khi lấy danh sách cài đặt:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi lấy danh sách cài đặt.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
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

            const { name, value } = req.body;

            if (!name || !value) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Tên và giá trị không được để trống.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (name.length > 100) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Tên không được vượt quá 100 ký tự.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const existingSetting = await db('settings')
                .whereRaw('LOWER(name) = ?', [name.toLowerCase()])
                .first();

            if (existingSetting) {
                return res.status(StatusCode.CONFLICT).json(transformResponse({
                    data: null,
                    message: 'Cài đặt này đã tồn tại.',
                    statusCode: StatusCode.CONFLICT,
                }));
            }

            const [newSetting] = await db('settings')
                .insert({
                    name,
                    value,
                    status: 1,
                })
                .returning('*');

            return res.status(StatusCode.CREATED).json(transformResponse({
                data: newSetting,
                message: 'Tạo cài đặt thành công.',
                statusCode: StatusCode.CREATED,
            }));
        } catch (error) {
            console.error('Lỗi khi tạo cài đặt:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi tạo cài đặt.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'PUT') {
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

            const { id, name, value, status } = req.body;

            if (!id || !name || !value) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'ID, tên và giá trị không được để trống.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const existingSetting = await db('settings')
                .whereRaw('LOWER(name) = ? AND id != ?', [name.toLowerCase(), id])
                .first();

            if (existingSetting) {
                return res.status(StatusCode.CONFLICT).json(transformResponse({
                    data: null,
                    message: 'Cài đặt này đã tồn tại.',
                    statusCode: StatusCode.CONFLICT,
                }));
            }

            const [updatedSetting] = await db('settings')
                .where({ id })
                .update({
                    name,
                    value,
                    status: status !== undefined ? status : 1,
                    updated_at: db.fn.now()
                })
                .returning('*');

            if (!updatedSetting) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Không tìm thấy cài đặt.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            return res.status(StatusCode.OK).json(transformResponse({
                data: updatedSetting,
                message: 'Cập nhật cài đặt thành công.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error('Lỗi khi cập nhật cài đặt:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi cập nhật cài đặt.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
            data: null,
            message: `Phương thức ${req.method} không được hỗ trợ.`,
            statusCode: StatusCode.METHOD_NOT_ALLOWED,
        }));
    }
}
