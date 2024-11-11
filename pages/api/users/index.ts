import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import bcrypt from 'bcrypt';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import {jwtVerify} from "jose";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;
            const search = req.query.search as string;
            const status = req.query.status as string;

            let query = db('users')
                .select('users.*', 'roles.name as role_name', 'images.url as avatar_url')
                .leftJoin('roles', 'users.role_id', 'roles.id')
                .leftJoin('images', 'users.avatar_id', 'images.id')
                .whereNot('users.status', -2);

            if (search) {
                query = query.where((builder) => {
                    builder.where('username', 'ilike', `%${search}%`)
                        .orWhere('email', 'ilike', `%${search}%`)
                        .orWhere('first_name', 'ilike', `%${search}%`)
                        .orWhere('last_name', 'ilike', `%${search}%`);
                });
            }

            if (status) {
                query = query.where('users.status', status);
            }

            const [count] = await db('users')
                .whereNot('status', -2)
                .count('* as total');
            const totalItems = parseInt(count.total as string);

            const users = await query
                .offset(offset)
                .limit(limit)
                .orderBy('users.id', 'desc');

            const totalPages = Math.ceil(totalItems / limit);
            res.status(StatusCode.OK).json(transformResponse({
                data: users || [],
                message: users.length ? 'Users retrieved successfully.' : 'No users found.',
                statusCode: StatusCode.OK,
                pagination: {
                    currentPage: page,
                    pageSize: limit,
                    totalItems,
                    totalPages,
                },
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: [],
                message: "An error occurred while retrieving users.",
                statusCode: StatusCode.INTERNAL_SERVER_ERROR
            }));
        }
    } else if (req.method === 'POST') {
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
            const { username, password, email, first_name, last_name, phone, address, avatar_id, role_id, status } = req.body;

            if (!username || !password || !email) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Username, password and email are required fields.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const existingUser = await db('users')
                .where({ username })
                .orWhere({ email })
                .first();

            if (existingUser) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Username or email already exists.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const [newUser] = await db('users').insert({
                username,
                password: hashedPassword,
                email,
                first_name,
                last_name,
                phone,
                address,
                avatar_id,
                role_id,
                status,
                created_at: db.fn.now(),
                updated_at: db.fn.now(),
            }).returning('*');

            res.status(StatusCode.CREATED).json(transformResponse({
                data: newUser,
                message: 'User created successfully.',
                statusCode: StatusCode.CREATED,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while creating the user.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'PATCH') {
        try {
            const { id, status } = req.body;

            const [updatedUser] = await db('users')
                .where({ id })
                .update({ status, updated_at: db.fn.now() })
                .returning('*');

            if (!updatedUser) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'User not found.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            res.status(StatusCode.OK).json(transformResponse({
                data: updatedUser,
                message: 'User status updated successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while updating the user status.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
