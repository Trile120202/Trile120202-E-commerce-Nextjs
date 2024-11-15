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
    if (req.method === 'GET') {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;
            const search = req.query.search as string;
            const status = req.query.status as string;

            let query = db('categories')
                .where('status', '!=', -2);

            if (search) {
                query = query.where((builder) => {
                    builder.where('name', 'ilike', `%${search}%`)
                        .orWhere('content', 'ilike', `%${search}%`);
                });
            }

            if (status) {
                query = query.where('status', status);
            }

            const [count] = await query.clone().count('* as total');
            const totalItems = count.total as number;

            const categories = await query
                .select('*')
                .offset(offset)
                .limit(limit)
                .orderBy('created_at', 'desc');

            const totalPages = Math.ceil(totalItems / limit);

            res.status(StatusCode.OK).json(transformResponse({
                data: categories,
                message: 'Categories retrieved successfully.',
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
                data: null,
                message: 'An error occurred while retrieving categories.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'POST') {
        try {
            const { name, slug, content, image_id, status } = req.body;

            if (!name || !slug) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Name and slug are required fields.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const existingCategory = await db('categories')
                .where({ slug })
                .first();

            if (existingCategory) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null, 
                    message: 'A category with this slug already exists.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const [newCategory] = await db('categories').insert({
                name,
                slug,
                content,
                image_id,
                status,
                created_at: db.fn.now(),
                updated_at: db.fn.now(),
            }).returning('*');

            res.status(StatusCode.CREATED).json(transformResponse({
                data: newCategory,
                message: 'Category created successfully.',
                statusCode: StatusCode.CREATED,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while creating the category.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    }
}
