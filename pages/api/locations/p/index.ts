import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
            data: null,
            message: 'Method not allowed',
            statusCode: StatusCode.METHOD_NOT_ALLOWED
        }));
    }

    try {
        const provinces = await db('provinces')
            .select('*')
            .orderBy('name', 'asc');

        return res.status(StatusCode.OK).json(transformResponse({
            data: provinces,
            message: 'Provinces retrieved successfully',
            statusCode: StatusCode.OK
        }));

    } catch (error) {
        console.error('Error retrieving provinces:', error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
            data: null,
            message: 'An error occurred while retrieving provinces',
            statusCode: StatusCode.INTERNAL_SERVER_ERROR
        }));
    }
}
