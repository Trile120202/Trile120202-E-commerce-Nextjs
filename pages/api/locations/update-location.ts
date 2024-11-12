import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import { jwtVerify } from "jose";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
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

            const userId = verified.payload.userId;
            const { 
                id,
                province_code,
                district_code,
                ward_code,
                postal_code,
                phone_number,
                address,
                is_default
            } = req.body;

            if (!id) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Location ID is required',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            const location = await db('delivery_addresses')
                .where({ id, user_id: userId, status: 1 })
                .first();

            if (!location) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Location not found',
                    statusCode: StatusCode.NOT_FOUND
                }));
            }

            await db('delivery_addresses')
                .where({ id })
                .update({
                    province_code,
                    district_code,
                    ward_code,
                    postal_code,
                    phone_number,
                    address,
                    updated_at: db.fn.now()
                });

            if (is_default !== undefined) {
                await db('user_delivery_addresses')
                    .where({ delivery_addresses_id: id, user_id: userId })
                    .update({
                        is_default,
                        updated_at: db.fn.now()
                    });

                if (is_default) {
                    await db('user_delivery_addresses')
                        .where({
                            user_id: userId,
                            status: 1
                        })
                        .whereNot('delivery_addresses_id', id)
                        .update({
                            is_default: false,
                            updated_at: db.fn.now()
                        });
                }
            }

            res.status(StatusCode.OK).json(transformResponse({
                data: null,
                message: 'Location updated successfully',
                statusCode: StatusCode.OK
            }));

        } catch (error) {
            console.error('Error updating location:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while updating the location',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR
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
                token as string,
                new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
            );

            const userId = verified.payload.userId;
            const { id } = req.body;

            if (!id) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Location ID is required',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            const location = await db('delivery_addresses')
                .where({ id, user_id: userId, status: 1 })
                .first();

            if (!location) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Location not found',
                    statusCode: StatusCode.NOT_FOUND
                }));
            }

            await db('delivery_addresses')
                .where({ id })
                .update({
                    status: 0,
                    updated_at: db.fn.now()
                });

            res.status(StatusCode.OK).json(transformResponse({
                data: null,
                message: 'Location deleted successfully',
                statusCode: StatusCode.OK
            }));

        } catch (error) {
            console.error('Error deleting location:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while deleting the location',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR
            }));
        }
    } else {
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
