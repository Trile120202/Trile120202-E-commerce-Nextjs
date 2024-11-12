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
        const { code } = req.query;

        const wards = await db('wards')
            .select('*')
            .where('district_code', code)
            .orderBy('name', 'asc');

        return res.status(StatusCode.OK).json(transformResponse({
            data: wards,
            message: 'Wards retrieved successfully',
            statusCode: StatusCode.OK
        }));

    } catch (error) {
        console.error('Error retrieving wards:', error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
            data: null,
            message: 'An error occurred while retrieving wards',
            statusCode: StatusCode.INTERNAL_SERVER_ERROR
        }));
    }
}
