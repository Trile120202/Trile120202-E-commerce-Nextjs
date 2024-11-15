import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import {jwtVerify} from "jose";
import { useAuth } from '@/hooks/useAuth';

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

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
            const banner = await db('banners')
                .where('banners.id', id)
                .whereNot('banners.status', -2)
                .first();

            if (!banner) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Không tìm thấy banner.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            const images = await db('banner_images')
                .join('images', 'banner_images.image_id', 'images.id')
                .where('banner_images.banner_id', id)
                .select('images.*');

            const bannerWithImages = {
                ...banner,
                images: images || []
            };

            res.status(StatusCode.OK).json(transformResponse({
                data: bannerWithImages,
                message: 'Lấy thông tin banner thành công.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi lấy thông tin banner.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'PUT') {
        try {
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

            const [updatedBanner] = await db('banners')
                .where({ id })
                .whereNot('status', -2)
                .update({
                    name,
                    location,
                    position,
                    status,
                    updated_at: db.fn.now(),
                })
                .returning('*');

            if (!updatedBanner) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Không tìm thấy banner.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            if (imageIds && Array.isArray(imageIds)) {
                await db('banner_images').where({ banner_id: id }).delete();
                
                const bannerImages = imageIds.map(imageId => ({
                    banner_id: id,
                    image_id: imageId,
                    status: 1,
                    created_at: db.fn.now(),
                    updated_at: db.fn.now()
                }));

                await db('banner_images').insert(bannerImages);
            }

            const images = await db('banner_images')
                .join('images', 'banner_images.image_id', 'images.id')
                .where('banner_images.banner_id', id)
                .select('images.*');

            const finalBanner = {
                ...updatedBanner,
                images: images || []
            };

            return res.status(StatusCode.OK).json(transformResponse({
                data: finalBanner,
                message: 'Cập nhật banner thành công.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi cập nhật banner.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
