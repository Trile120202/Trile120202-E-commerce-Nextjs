import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const ram = await db('ram')
                .where('id', id)
                .first();

            if (!ram) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'RAM not found.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            res.status(StatusCode.OK).json(transformResponse({
                data: ram,
                message: 'RAM retrieved successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving the RAM.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'PUT') {
        try {
            const { name, type, capacity, speed, brand, status } = req.body;

            if (!name || !type || !capacity || !speed || !brand) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'All fields are required.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (name.length > 100 || type.length > 50 || brand.length > 50) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Field length exceeds maximum allowed.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            // Validate capacity and speed are positive integers
            if (!Number.isInteger(capacity) || capacity <= 0 || !Number.isInteger(speed) || speed <= 0) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Capacity and speed must be positive integers.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const [updatedRam] = await db('ram')
                .where({ id })
                .update({
                    name,
                    type,
                    capacity,
                    speed,
                    brand,
                    status,
                    updated_at: db.fn.now(),
                })
                .returning('*');

            if (!updatedRam) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'RAM not found.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            return res.status(StatusCode.OK).json(transformResponse({
                data: updatedRam,
                message: 'RAM updated successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while updating the RAM.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}