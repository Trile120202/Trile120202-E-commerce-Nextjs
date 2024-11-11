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

            const [{ count }] = await db('cpus')
                .whereNot('status', -2)
                .count();
            const totalItems = parseInt(count as string);
            const totalPages = Math.ceil(totalItems / limit);

            const cpus = await db('cpus')
                .select('*')
                .whereNot('status', -2)
                .offset(offset)
                .limit(limit)
                .orderBy('created_at', 'desc');

            res.status(StatusCode.OK).json(transformResponse({
                data: cpus,
                message: 'CPUs retrieved successfully.',
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
                message: 'An error occurred while retrieving CPUs.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'POST') {
        try {
            const token = req.cookies.token;

            const verified = await jwtVerify(
                token,
                new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
            );

            if (!token && verified.payload.roleId) {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'Unauthorized - No token provided',
                    statusCode: StatusCode.UNAUTHORIZED
                }));
            }
            const { name, brand, model, cores, threads, base_clock, boost_clock, cache, status } = req.body;

            if (!name) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Tên CPU không được để trống.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (name.length > 100) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Tên CPU không được vượt quá 100 ký tự.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (brand && brand.length > 50) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Thương hiệu không được vượt quá 50 ký tự.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (model && model.length > 50) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Model không được vượt quá 50 ký tự.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (status !== undefined && (typeof status !== 'number' || ![0, 1].includes(status))) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Trạng thái không hợp lệ.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const [newCpu] = await db('cpus').insert({
                name,
                brand,
                model,
                cores,
                threads,
                base_clock,
                boost_clock,
                cache,
                status: status ?? 1,
                created_at: db.fn.now(),
                updated_at: db.fn.now(),
            }).returning('*');

            if (!newCpu) {
                throw new Error('Không thể tạo CPU mới');
            }

            res.status(StatusCode.CREATED).json(transformResponse({
                data: newCpu,
                message: 'Tạo CPU mới thành công.',
                statusCode: StatusCode.CREATED,
            }));
        } catch (error) {
            console.error('Lỗi khi tạo CPU:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi tạo CPU mới.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
