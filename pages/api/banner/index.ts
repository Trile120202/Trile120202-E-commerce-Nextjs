import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import {jwtVerify} from "jose";
import { useAuth } from '@/hooks/useAuth';

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const verified = await useAuth(req, res);
            if (!verified || verified.payload.roleName !== 'admin') {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'Unauthorized',
                    statusCode: StatusCode.UNAUTHORIZED
                }));
            }
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;
            const search = req.query.search as string || '';

            const [{ count }] = await db('banners')
                .where('name', 'ilike', `%${search}%`)
                .whereNot('status', -2)
                .count();
            const totalItems = parseInt(count as string);
            const totalPages = Math.ceil(totalItems / limit);

            const banners = await db('banners')
                .leftJoin('banner_images', 'banners.id', 'banner_images.banner_id')
                .leftJoin('images', 'banner_images.image_id', 'images.id')
                .where('banners.name', 'ilike', `%${search}%`)
                .whereNot('banners.status', -2)
                .select(
                    'banners.*',
                    db.raw('ARRAY_AGG(DISTINCT images.*) as images')
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
    } else if (req.method === 'POST') {
        try {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const verified = await useAuth(req, res);
            if (!verified || verified.payload.roleName !== 'admin') {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'Unauthorized',
                    statusCode: StatusCode.UNAUTHORIZED
                }));
            }

            const { name, location, position, status, imageIds } = req.body;

            if (!name || !location || !position) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Tên banner, vị trí và định vị không được để trống.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (imageIds && !Array.isArray(imageIds)) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Danh sách ảnh phải là một mảng.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (name.length > 100) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Tên banner không được vượt quá 100 ký tự.',
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

            const existingBanners = await db('banners')
                .where({
                    location: location,
                    position: position,
                    status: 1
                });

            if (existingBanners.length > 0) {
                await db('banners')
                    .where({
                        location: location,
                        position: position,
                        status: 1
                    })
                    .update({
                        status: 0,
                        updated_at: db.fn.now()
                    });
            }

            const [banner] = await db('banners')
                .insert({
                    name,
                    location,
                    position,
                    status: status || 1,
                    created_at: db.fn.now(),
                    updated_at: db.fn.now()
                })
                .returning('*');

            if (!banner) {
                throw new Error('Failed to create banner');
            }

            if (imageIds && imageIds.length > 0) {
                const bannerImages = imageIds.map(imageId => ({
                    banner_id: banner.id,
                    image_id: imageId,
                    status: 1,
                    created_at: db.fn.now(),
                    updated_at: db.fn.now()
                }));

                await db('banner_images').insert(bannerImages);
            }

            const createdBanner = await db('banners')
                .leftJoin('banner_images', 'banners.id', 'banner_images.banner_id')
                .leftJoin('images', 'banner_images.image_id', 'images.id')
                .where('banners.id', banner.id)
                .select(
                    'banners.*',
                    db.raw('ARRAY_AGG(images.*) as images')
                )
                .groupBy('banners.id')
                .first();

            res.status(StatusCode.CREATED).json(transformResponse({
                data: createdBanner,
                message: 'Tạo banner thành công.',
                statusCode: StatusCode.CREATED,
            }));
        } catch (error) {
            console.error('Error in POST handler:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Internal server error',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    }
}
