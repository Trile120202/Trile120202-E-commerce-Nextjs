import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import { StatusApp } from "@/lib/statusApp";
// import {parse} from "cookie";

const db = knex(knexConfig);

interface JwtPayload {
    userId: number;
    iat: number;
    exp: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                data: null,
                message: 'No token provided.',
                statusCode: StatusCode.UNAUTHORIZED,
            }));
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'xyz') as JwtPayload;

            const user = await db('users')
                .select('users.*', 'roles.name as role_name')
                .leftJoin('roles', 'users.role_id', 'roles.id')
                .where('users.id', decoded.userId)
                .first();

            if (!user) {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'User not found.',
                    statusCode: StatusCode.UNAUTHORIZED,
                }));
            }

            if (user.status === StatusApp.DELETED) {
                return res.status(StatusCode.FORBIDDEN).json(transformResponse({
                    data: null,
                    message: 'User account has been deleted.',
                    statusCode: StatusCode.FORBIDDEN,
                }));
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userData } = user;

            res.status(StatusCode.OK).json(transformResponse({
                data: { ...userData, role: user.role_name },
                message: 'User info retrieved successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                data: null,
                message: 'Invalid token.',
                statusCode: StatusCode.UNAUTHORIZED,
            }));
        }
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}


//
// const cookies = parse(req.headers.cookie || '');
// const tokena  = cookies.token;
//
// if (!token) {
//     return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
//         data: null,
//         message: 'No token provided.',
//         statusCode: StatusCode.UNAUTHORIZED,
//     }));
// }
