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

            const locations = await db('delivery_addresses')
                .select(
                    'delivery_addresses.*',
                    'user_delivery_addresses.is_default',
                    'provinces.name as province_name',
                    'districts.name as district_name', 
                    'wards.name as ward_name'
                )
                .join('user_delivery_addresses', 'delivery_addresses.id', 'user_delivery_addresses.delivery_addresses_id')
                .leftJoin('provinces', 'delivery_addresses.province_code', 'provinces.code')
                .leftJoin('districts', 'delivery_addresses.district_code', 'districts.code')
                .leftJoin('wards', 'delivery_addresses.ward_code', 'wards.code')
                .where({
                    'delivery_addresses.user_id': userId,
                    'delivery_addresses.status': 1,
                    'user_delivery_addresses.status': 1
                })
                .orderBy('user_delivery_addresses.is_default', 'desc');

            res.status(StatusCode.OK).json(transformResponse({
                data: locations,
                message: 'Locations retrieved successfully.',
                statusCode: StatusCode.OK
            }));

        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving locations.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR
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

            const userId = verified.payload.userId;
            const { 
                province_code,
                district_code,
                ward_code,
                postal_code,
                phone_number,
                address,
                is_default = false
            } = req.body;

            if (!province_code || !district_code || !ward_code) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Province, district and ward codes are required',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            if (!phone_number) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Phone number is required',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            const [newLocation] = await db('delivery_addresses').insert({
                user_id: userId,
                province_code,
                district_code,
                ward_code,
                postal_code,
                phone_number,
                address,
                status: 1,
                created_at: db.fn.now(),
                updated_at: db.fn.now()
            }).returning('*');

            await db('user_delivery_addresses').insert({
                user_id: userId,
                delivery_addresses_id: newLocation.id,
                is_default,
                status: 1,
                created_at: db.fn.now(),
                updated_at: db.fn.now()
            });

            if (is_default) {
                await db('user_delivery_addresses')
                    .where({
                        user_id: userId,
                        status: 1
                    })
                    .whereNot('delivery_addresses_id', newLocation.id)
                    .update({
                        is_default: false,
                        updated_at: db.fn.now()
                    });
            }

            res.status(StatusCode.CREATED).json(transformResponse({
                data: newLocation,
                message: 'Location created successfully',
                statusCode: StatusCode.CREATED
            }));

        } catch (error) {
            console.error('Error creating location:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while creating the location',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
