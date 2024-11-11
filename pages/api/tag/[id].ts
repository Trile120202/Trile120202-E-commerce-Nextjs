import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import {jwtVerify} from "jose";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const tag = await db('tags')
                .where('id', id)
                .where('status', '!=', -2)
                .first();

            if (!tag) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Không tìm thấy từ khóa.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            res.status(StatusCode.OK).json(transformResponse({
                data: tag,
                message: 'Lấy thông tin từ khóa thành công.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error('Lỗi khi lấy thông tin từ khóa:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi lấy thông tin từ khóa.',
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
                token as string,
                new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
            );

            if (!token && verified.payload.roleId===1) {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'Unauthorized - No token provided',
                    statusCode: StatusCode.UNAUTHORIZED
                }));
            }

            const { name, status } = req.body;

            if (!name) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Tên từ khóa không được để trống.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (name.length > 100) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Tên từ khóa không được vượt quá 100 ký tự.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const existingTag = await db('tags')
                .whereRaw('LOWER(name) = ? AND id != ?', [name.toLowerCase(), id])
                .first();
            if (existingTag) {
                return res.status(StatusCode.CONFLICT).json(transformResponse({
                    data: null,
                    message: 'Từ khóa này đã tồn tại.',
                    statusCode: StatusCode.CONFLICT,
                }));
            }

            const [updatedTag] = await db('tags')
                .where({ id })
                .update({
                    name,
                    status: status !== undefined ? status : 1,
                    updated_at: db.fn.now()
                })
                .returning('*');

            if (!updatedTag) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Không tìm thấy từ khóa.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            return res.status(StatusCode.OK).json(transformResponse({
                data: updatedTag,
                message: 'Cập nhật từ khóa thành công.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error('Lỗi khi cập nhật từ khóa:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi cập nhật từ khóa.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
            data: null,
            message: `Phương thức ${req.method} không được hỗ trợ.`,
            statusCode: StatusCode.METHOD_NOT_ALLOWED,
        }));
    }
}
