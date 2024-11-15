import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import {jwtVerify} from "jose";
import { useAuth } from '@/hooks/useAuth';

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const verified = await useAuth(req, res);
    if (!verified || verified.payload.roleName !== 'admin') {
        return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
            data: null,
            message: 'Unauthorized',
            statusCode: StatusCode.UNAUTHORIZED
        }));
}
    if (req.method !== 'PUT') {
        res.setHeader('Allow', ['PUT']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
            data: null,
            message: `Method ${req.method} Not Allowed`,
            statusCode: StatusCode.METHOD_NOT_ALLOWED
        }));
    }

    try {
        const { id, status } = req.body;

        if (!id || status === undefined) {
            return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                data: null,
                message: 'Category ID and status are required',
                statusCode: StatusCode.BAD_REQUEST
            }));
        }

        const existingCategory = await db('categories')
            .where({ id })
            .whereNot('status', -2)
            .first();

        if (!existingCategory) {
            return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                data: null,
                message: 'Category not found',
                statusCode: StatusCode.NOT_FOUND
            }));
        }

        const [updatedCategory] = await db('categories')
            .where({ id })
            .update({ 
                status,
                updated_at: db.fn.now()
            })
            .returning(['id', 'name', 'slug', 'status', 'updated_at']);

        return res.status(StatusCode.OK).json(transformResponse({
            data: updatedCategory,
            message: 'Category status updated successfully',
            statusCode: StatusCode.OK
        }));

    } catch (error) {
        console.error(error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
            data: null,
            message: 'An error occurred while updating category status',
            statusCode: StatusCode.INTERNAL_SERVER_ERROR
        }));
    }
}
