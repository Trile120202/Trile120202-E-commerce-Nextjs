import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;
            const location = req.query.location as string || '';
            const position = req.query.position as string || '';

            const [{ count }] = await db('banners')
                .where('location', 'ilike', `%${location}%`)
                .where('position', 'ilike', `%${position}%`)
                .whereNot('status', -2)
                .count();
            const totalItems = parseInt(count as string);
            const totalPages = Math.ceil(totalItems / limit);

            const banners = await db('banners')
                .leftJoin('banner_images', 'banners.id', 'banner_images.banner_id')
                .leftJoin('images', 'banner_images.image_id', 'images.id')
                .where('location', 'ilike', `%${location}%`)
                .where('position', 'ilike', `%${position}%`)
                .whereNot('banners.status', -2)
                .select(
                    'banners.*',
                    db.raw('ARRAY_AGG(images.url) as images')
                )
                .groupBy('banners.id')
                .offset(offset)
                .limit(limit)
                .orderBy('banners.created_at', 'desc');

            res.status(StatusCode.OK).json(transformResponse({
                data: banners,
                message: 'Lấy danh sách banner thành công.',
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
                message: 'Đã xảy ra lỗi khi lấy danh sách banner.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
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