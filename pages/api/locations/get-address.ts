import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const provinces = await db('provinces').select('name');
            const districts = await db('districts').select('name');
            const wards = await db('wards').select('name');

            res.status(StatusCode.OK).json(transformResponse({
                data: {
                    provinces,
                    districts,
                    wards
                },
                message: 'Names retrieved successfully.',
                statusCode: StatusCode.OK
            }));
        } catch (error) {
            console.error('Error retrieving names:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving names.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR
            }));
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
