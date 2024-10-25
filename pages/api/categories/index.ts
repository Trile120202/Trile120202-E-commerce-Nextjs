import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;
            const search = req.query.search as string;
            const status = req.query.status as string;

            let query = db('categories');

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
                .limit(limit);

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
            const { name, slug, content, parent_id, image_id } = req.body;

            const [newCategory] = await db('categories').insert({
                name,
                slug,
                content,
                parent_id,
                image_id,
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
    } else if (req.method === 'PUT') {
        try {
            const { id, name, slug, content, parent_id, image_id } = req.body;

            const [updatedCategory] = await db('categories')
                .where({ id })
                .update({
                    name,
                    slug,
                    content,
                    parent_id,
                    image_id,
                    updated_at: db.fn.now(),
                })
                .returning('*');

            if (!updatedCategory) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Category not found.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            res.status(StatusCode.OK).json(transformResponse({
                data: updatedCategory,
                message: 'Category updated successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while updating the category.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'PATCH') {
        try {
            const { id, status } = req.body;

            const [updatedCategory] = await db('categories')
                .where({ id })
                .update({ status, updated_at: db.fn.now() })
                .returning('*');

            if (!updatedCategory) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Category not found.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            res.status(StatusCode.OK).json(transformResponse({
                data: updatedCategory,
                message: 'Category status updated successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while updating the category status.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
