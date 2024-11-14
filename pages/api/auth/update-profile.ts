import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import { jwtVerify } from "jose";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
            data: null,
            message: 'Method not allowed',
            statusCode: StatusCode.METHOD_NOT_ALLOWED
        }));
    }

    const token = req.cookies.token;
    if (!token) {
        return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
            data: null,
            message: 'Unauthorized - No token provided',
            statusCode: StatusCode.UNAUTHORIZED
        }));
    }

    try {
        const verified = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
        );
        const userId = verified.payload.userId;
        const { fullName } = req.body;
        console.log(req.body);

        if (!fullName) {
            return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                data: null,
                message: 'Name or email is required',
                statusCode: StatusCode.BAD_REQUEST
            }));
        }

        await db('users')
            .where({ id: userId })
            .update({
              full_name:fullName,
                updated_at: db.fn.now()
            });

        return res.status(StatusCode.OK).json(transformResponse({
            data: [],
            message: 'User profile updated successfully',
            statusCode: StatusCode.OK
        }));

    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
            data: null,
            message: 'Internal server error',
            statusCode: StatusCode.INTERNAL_SERVER_ERROR
        }));
    }
}
