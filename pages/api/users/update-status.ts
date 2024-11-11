import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import {jwtVerify} from "jose";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        res.setHeader('Allow', ['PATCH']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
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
        const { id, status } = req.body;

        if (!id || status === undefined) {
            return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                data: null,
                message: 'User ID and status are required',
                statusCode: StatusCode.BAD_REQUEST
            }));
        }

        const existingUser = await db('users')
            .where({ id })
            .whereNot('status', -2)
            .first();

        if (!existingUser) {
            return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                data: null,
                message: 'User not found',
                statusCode: StatusCode.NOT_FOUND
            }));
        }

        const [updatedUser] = await db('users')
            .where({ id })
            .update({ 
                status,
                updated_at: db.fn.now()
            })
            .returning(['id', 'username', 'email', 'status', 'updated_at']);

        return res.status(StatusCode.OK).json(transformResponse({
            data: updatedUser,
            message: 'User status updated successfully',
            statusCode: StatusCode.OK
        }));

    } catch (error) {
        console.error(error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
            data: null,
            message: 'An error occurred while updating user status',
            statusCode: StatusCode.INTERNAL_SERVER_ERROR
        }));
    }
}
