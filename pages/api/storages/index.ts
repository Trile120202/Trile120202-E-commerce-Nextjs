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
            const search = req.query.search as string || '';

            const [{ count }] = await db('hard_drives')
                .where('name', 'ilike', `%${search}%`)
                .whereNot('status', -2)
                .count();
            const totalItems = parseInt(count as string);
            const totalPages = Math.ceil(totalItems / limit);

            const hardDrives = await db('hard_drives')
                .where('name', 'ilike', `%${search}%`)
                .whereNot('status', -2)
                .select('*')
                .offset(offset)
                .limit(limit)
                .orderBy('created_at', 'desc');

            res.status(StatusCode.OK).json(transformResponse({
                data: hardDrives,
                message: 'Hard drives retrieved successfully.',
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
                message: 'An error occurred while retrieving hard drives.',
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
            const { name, type, capacity, interface: driveInterface, brand, status } = req.body;

            if (!name || !type || !capacity || !driveInterface || !brand) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Tên ổ cứng, loại ổ cứng, dung lượng, giao diện và thương hiệu không được để trống.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (name.length > 100) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Tên ổ cứng không được vượt quá 100 ký tự.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (type.length > 50) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Loại ổ cứng không được vượt quá 50 ký tự.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (brand.length > 50) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Thương hiệu không được vượt quá 50 ký tự.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (driveInterface.length > 50) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Giao diện không được vượt quá 50 ký tự.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (capacity.length > 50) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Dung lượng không được vượt quá 50 ký tự.',
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

            const [newHardDrive] = await db('hard_drives').insert({
                name,
                type,
                capacity,
                interface: driveInterface,
                brand,
                status: status ?? 1,
                created_at: db.fn.now(),
                updated_at: db.fn.now(),
            }).returning('*');

            if (!newHardDrive) {
                throw new Error('Không thể tạo ổ cứng mới');
            }

            res.status(StatusCode.CREATED).json(transformResponse({
                data: newHardDrive,
                message: 'Tạo ổ cứng mới thành công.',
                statusCode: StatusCode.CREATED,
            }));
        } catch (error) {
            console.error('Lỗi khi tạo ổ cứng:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi tạo ổ cứng mới.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'PUT') {
        try {
            const { id, name, type, capacity, interface: driveInterface, brand, status } = req.body;

            if (!id) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'ID không được để trống.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const updateData: any = {};
            if (name) {
                if (name.length > 100) {
                    return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                        data: null,
                        message: 'Tên ổ cứng không được vượt quá 100 ký tự.',
                        statusCode: StatusCode.BAD_REQUEST,
                    }));
                }
                updateData.name = name;
            }

            if (type) {
                if (type.length > 50) {
                    return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                        data: null,
                        message: 'Loại ổ cứng không được vượt quá 50 ký tự.',
                        statusCode: StatusCode.BAD_REQUEST,
                    }));
                }
                updateData.type = type;
            }

            if (capacity) {
                if (capacity.length > 50) {
                    return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                        data: null,
                        message: 'Dung lượng không được vượt quá 50 ký tự.',
                        statusCode: StatusCode.BAD_REQUEST,
                    }));
                }
                updateData.capacity = capacity;
            }

            if (driveInterface) {
                if (driveInterface.length > 50) {
                    return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                        data: null,
                        message: 'Giao diện không được vượt quá 50 ký tự.',
                        statusCode: StatusCode.BAD_REQUEST,
                    }));
                }
                updateData.interface = driveInterface;
            }

            if (brand) {
                if (brand.length > 50) {
                    return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                        data: null,
                        message: 'Thương hiệu không được vượt quá 50 ký tự.',
                        statusCode: StatusCode.BAD_REQUEST,
                    }));
                }
                updateData.brand = brand;
            }

            if (status !== undefined) {
                if (typeof status !== 'number' || ![0, 1].includes(status)) {
                    return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                        data: null,
                        message: 'Trạng thái không hợp lệ.',
                        statusCode: StatusCode.BAD_REQUEST,
                    }));
                }
                updateData.status = status;
            }

            updateData.updated_at = db.fn.now();

            const [updatedHardDrive] = await db('hard_drives')
                .where({ id })
                .update(updateData)
                .returning('*');

            if (!updatedHardDrive) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Không tìm thấy ổ cứng.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            res.status(StatusCode.OK).json(transformResponse({
                data: updatedHardDrive,
                message: 'Cập nhật ổ cứng thành công.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error('Lỗi khi cập nhật ổ cứng:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi cập nhật ổ cứng.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'ID không được để trống.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const [deletedHardDrive] = await db('hard_drives')
                .where({ id })
                .delete()
                .returning('*');

            if (!deletedHardDrive) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Không tìm thấy ổ cứng.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            res.status(StatusCode.OK).json(transformResponse({
                data: deletedHardDrive,
                message: 'Xóa ổ cứng thành công.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error('Lỗi khi xóa ổ cứng:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi xóa ổ cứng.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
