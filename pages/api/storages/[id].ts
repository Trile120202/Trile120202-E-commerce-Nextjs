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
            const storage = await db('hard_drives')
                .where('id', id)
                .first();

            if (!storage) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Hard drive not found.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            res.status(StatusCode.OK).json(transformResponse({
                data: storage,
                message: 'Hard drive retrieved successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving the hard drive.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'PUT') {
        try {
            const { name, type, capacity, interface: interfaceType, brand, status } = req.body;

            // Validate required fields
            if (!name || !type || !capacity || !interfaceType || !brand) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'All fields are required.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            // Validate field lengths
            if (name.length > 100 || type.length > 50 || interfaceType.length > 50 || brand.length > 50) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Field length exceeds maximum allowed.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            // Validate capacity is a positive integer
            if (!Number.isInteger(capacity) || capacity <= 0) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Capacity must be a positive integer.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const [updatedStorage] = await db('hard_drives')
                .where({ id })
                .update({
                    name,
                    type,
                    capacity,
                    interface: interfaceType,
                    brand,
                    status,
                    updated_at: db.fn.now(),
                })
                .returning('*');

            if (!updatedStorage) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Hard drive not found.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            return res.status(StatusCode.OK).json(transformResponse({
                data: updatedStorage,
                message: 'Hard drive updated successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while updating the hard drive.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
