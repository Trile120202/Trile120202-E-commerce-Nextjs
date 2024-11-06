import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import {StatusApp} from "@/lib/statusApp";
import { serialize } from 'cookie';

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                data: null,
                message: 'Username and password are required.',
                statusCode: StatusCode.BAD_REQUEST,
            }));
        }

        try {
            const user = await db('users')
                .select('users.*', 'roles.name as role_name')
                .leftJoin('roles', 'users.role_id', 'roles.id')
                .where('users.username', username)
                .first();


            if (!user) {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'Invalid username or password.',
                    statusCode: StatusCode.UNAUTHORIZED,
                }));
            }
            if (user.status==StatusApp.DELETED) {
                return res.status(StatusCode.FORBIDDEN).json(transformResponse({
                    data: null,
                    message: 'User account has been deleted.',
                    statusCode: StatusCode.FORBIDDEN,
                }));
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'Invalid username or password.',
                    statusCode: StatusCode.UNAUTHORIZED,
                }));
            }

            const { password: _, ...userData } = user;

            const accessToken = jwt.sign(
                { userId: user.id, username: user.username, role: user.role_name },
                process.env.JWT_SECRET || 'xyz',
                { expiresIn: '1h' }
            );

            const refreshToken = jwt.sign(
                { userId: user.id, username: user.username },
                process.env.JWT_REFRESH_SECRET || 'xyz',
                { expiresIn: '7d' }
            );


            res.setHeader('Set-Cookie', serialize('token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600,
                sameSite: 'strict',
                path: '/',
            }));

            res.status(StatusCode.OK).json(transformResponse({
                data: { ...userData, accessToken, refreshToken },
                message: 'Logged in successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Failed to login.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
