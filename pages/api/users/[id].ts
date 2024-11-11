import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import {jwtVerify} from "jose";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { id } = req.query;

    switch (method) {
        case 'GET':
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
                const user = await db('users')
                    .select('users.*', 'images.url as avatar_url')
                    .leftJoin('images', 'users.avatar_id', 'images.id')
                    .where('users.id', id)
                    .whereNot('users.status', -2)
                    .first();

                if (!user) {
                    return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                        data: null,
                        message: 'User not found',
                        statusCode: StatusCode.NOT_FOUND
                    }));
                }

                delete user.password;

                res.status(StatusCode.OK).json(transformResponse({
                    data: user,
                    message: 'User retrieved successfully',
                    statusCode: StatusCode.OK
                }));
            } catch (error) {
                console.error(error);
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                    data: null,
                    message: 'Error fetching user',
                    statusCode: StatusCode.INTERNAL_SERVER_ERROR
                }));
            }
            break;

        case 'PUT':
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
                const { username, email, first_name, last_name, avatar_id, status, role_id } = req.body;

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

                const userWithSameUsername = await db('users')
                    .where('username', username)
                    .whereNot('id', id)
                    .whereNot('status', -2)
                    .first();
                
                if (userWithSameUsername) {
                    return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                        data: null,
                        message: 'Username is already taken',
                        statusCode: StatusCode.BAD_REQUEST
                    }));
                }

                const userWithSameEmail = await db('users')
                    .where('email', email)
                    .whereNot('id', id)
                    .whereNot('status', -2)
                    .first();
                
                if (userWithSameEmail) {
                    return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                        data: null,
                        message: 'Email is already taken',
                        statusCode: StatusCode.BAD_REQUEST
                    }));
                }

                await db('users').where({ id }).update({
                    username,
                    email,
                    first_name,
                    last_name,
                    avatar_id,
                    status,
                    role_id,
                    updated_at: new Date()
                });

                const updatedUser = await db('users')
                    .select('users.*', 'images.url as avatar_url')
                    .leftJoin('images', 'users.avatar_id', 'images.id')
                    .where('users.id', id)
                    .whereNot('users.status', -2)
                    .first();

                delete updatedUser.password;

                res.status(StatusCode.OK).json(transformResponse({
                    data: updatedUser,
                    message: 'User updated successfully',
                    statusCode: StatusCode.OK
                }));
            } catch (error) {
                console.error(error);
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                    data: null,
                    message: 'Error updating user',
                    statusCode: StatusCode.INTERNAL_SERVER_ERROR
                }));
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'PUT']);
            res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${method} Not Allowed`);
    }
}