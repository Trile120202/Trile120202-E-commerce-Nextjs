import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import { jwtVerify } from "jose";

const db = knex(knexConfig);

interface Setting {
    name: string;
    value: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
            data: null,
            message: 'Method not allowed',
            statusCode: StatusCode.METHOD_NOT_ALLOWED
        }));
    }

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

        const settings: Setting[] = req.body;

        if (!Array.isArray(settings)) {
            return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                data: null,
                message: 'Invalid request format. Expected array of settings',
                statusCode: StatusCode.BAD_REQUEST
            }));
        }

        const results = await Promise.all(settings.map(async ({ name, value }) => {
            const existingSetting = await db('settings')
                .where({ name, status: 1 })
                .first();

            if (existingSetting) {
                await db('settings')
                    .where({ name, status: 1 })
                    .update({
                        value,
                        updated_at: db.fn.now()
                    });
                return { name, action: 'updated' };
            } else {
                await db('settings').insert({
                    name,
                    value,
                    status: 1,
                    created_at: db.fn.now(),
                    updated_at: db.fn.now()
                });
                return { name, action: 'created' };
            }
        }));

        return res.status(StatusCode.OK).json(transformResponse({
            data: results,
            message: 'Cập nhật cài đặt thành công',
            statusCode: StatusCode.OK
        }));

    } catch (error) {
        console.error('Lỗi khi cập nhật cài đặt:', error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
            data: null,
            message: 'Đã xảy ra lỗi khi cập nhật cài đặt',
            statusCode: StatusCode.INTERNAL_SERVER_ERROR
        }));
    }
}
