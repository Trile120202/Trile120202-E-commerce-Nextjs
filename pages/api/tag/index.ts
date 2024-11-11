import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import {jwtVerify} from "jose";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;
            const search = req.query.search as string;
            const status = req.query.status as string;

            let query = db('tags').whereNot('status', -2);

            if (search) {
                query = query.whereRaw('LOWER(name) LIKE ?', [`%${search.toLowerCase()}%`]);
            }

            if (status && status !== 'all') {
                query = query.where('status', parseInt(status));
            }

            const [tags, totalResult] = await Promise.all([
                query.clone()
                    .select('*')
                    .orderBy('id', 'desc')
                    .limit(limit)
                    .offset(offset),
                query.clone().count('* as count').first()
            ]);

            const total = totalResult?.count as number;
            const totalPages = Math.ceil(total / limit);

            res.status(StatusCode.OK).json(transformResponse({
                data: tags,
                message: 'Lấy danh sách từ khóa thành công.',
                statusCode: StatusCode.OK,
                pagination: {
                    currentPage: page,
                    pageSize: limit,
                    totalItems: total,
                    totalPages
                }
            }));
        } catch (error) {
            console.error('Lỗi khi lấy danh sách từ khóa:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi lấy danh sách từ khóa.',
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

            const existingTag = await db('tags').whereRaw('LOWER(name) = ?', [name.toLowerCase()]).first();
            if (existingTag) {
                return res.status(StatusCode.CONFLICT).json(transformResponse({
                    data: null,
                    message: 'Từ khóa này đã tồn tại.',
                    statusCode: StatusCode.CONFLICT,
                }));
            }

            const [newTag] = await db('tags')
                .insert({ 
                    name, 
                    status: status || 1
                })
                .returning('*');

            res.status(StatusCode.CREATED).json(transformResponse({
                data: newTag,
                message: 'Tạo từ khóa thành công.',
                statusCode: StatusCode.CREATED,
            }));
        } catch (error) {
            console.error('Lỗi khi tạo từ khóa:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi tạo từ khóa.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'PUT') {
        try {
            const { id, name, status } = req.body;

            if (!id || !name) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'ID và tên từ khóa không được để trống.',
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
                    status: status !== undefined ? status : 1
                })
                .returning('*');

            if (!updatedTag) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Không tìm thấy từ khóa.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            res.status(StatusCode.OK).json(transformResponse({
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
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
            data: null,
            message: `Phương thức ${req.method} không được hỗ trợ.`,
            statusCode: StatusCode.METHOD_NOT_ALLOWED,
        }));
    }
}
