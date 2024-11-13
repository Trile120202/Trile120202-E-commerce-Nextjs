import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
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

            let query = db('roles');

            if (search) {
                query = query.whereRaw('LOWER(name) LIKE ?', [`%${search.toLowerCase()}%`]);
            }

            if (status && status !== 'all') {
                query = query.where('status', parseInt(status));
            }

            const [roles, totalResult] = await Promise.all([
                query.clone()
                    .select('*')
                    .orderBy('id', 'desc')
                    .limit(limit)
                    .offset(offset),
                query.clone().count('* as count').first()
            ]);

            const total = totalResult?.count as number;
            const totalPages = Math.ceil(total / limit);

            res.status(StatusCode.OK).json(transformResponse({
                data: {
                    roles,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalItems: total,
                        itemsPerPage: limit
                    }
                },
                message: 'Roles retrieved successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving roles.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
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

            if (!token && verified.payload.roleName !== "admin") {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'Unauthorized - No token provided',
                    statusCode: StatusCode.UNAUTHORIZED
                }));
            }
            const { name, description, status } = req.body;

            if (!name || !description) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Role name and description are required.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const existingRole = await db('roles').whereRaw('LOWER(name) = ?', [name.toLowerCase()]).first();
            if (existingRole) {
                return res.status(StatusCode.CONFLICT).json(transformResponse({
                    data: null,
                    message: 'Role with this name already exists.',
                    statusCode: StatusCode.CONFLICT,
                }));
            }

            const [newRole] = await db('roles')
                .insert({ name, description, status: status || 1 })
                .returning('*');

            res.status(StatusCode.CREATED).json(transformResponse({
                data: newRole,
                message: 'Role created successfully.',
                statusCode: StatusCode.CREATED,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while creating the role.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'PUT') {
        try {
            const { id, name, description, status } = req.body;

            if (!id || !name || !description) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Role ID, name and description are required.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const existingRole = await db('roles')
                .whereRaw('LOWER(name) = ? AND id != ?', [name.toLowerCase(), id])
                .first();
            if (existingRole) {
                return res.status(StatusCode.CONFLICT).json(transformResponse({
                    data: null,
                    message: 'Another role with this name already exists.',
                    statusCode: StatusCode.CONFLICT,
                }));
            }

            const [updatedRole] = await db('roles')
                .where({ id })
                .update({ 
                    name, 
                    description,
                    status: status !== undefined ? status : 1,
                    updated_at: new Date()
                })
                .returning('*');

            if (!updatedRole) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Role not found.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            res.status(StatusCode.OK).json(transformResponse({
                data: updatedRole,
                message: 'Role updated successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while updating the role.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'PATCH') {
        try {
            const { id, status } = req.body;

            if (!id || status === undefined) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Role ID and status are required.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const updatedRole = await db('roles')
                .where({ id })
                .update({ status })
                .returning('*');

            if (updatedRole.length === 0) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Role not found.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            res.status(StatusCode.OK).json(transformResponse({
                data: updatedRole[0],
                message: 'Role status updated successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while updating the role status.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
