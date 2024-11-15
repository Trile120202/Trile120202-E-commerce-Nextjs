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
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const category = await db('categories')
                .select('categories.*', 'images.url as image_url', 'images.alt_text as image_alt_text')
                .leftJoin('images', 'categories.image_id', 'images.id')
                .where('categories.id', id)
                .where('categories.status', '!=', -2)
                .first();

            if (!category) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Category not found.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            res.status(StatusCode.OK).json(transformResponse({
                data: category,
                message: 'Category retrieved successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving the category.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'PUT') {
        try {
            const { name, slug, content, parent_id, image_id, status } = req.body;

            if (!name || !slug) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Name and slug are required fields.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const existingCategory = await db('categories')
                .where({ slug })
                .whereNot({ id })
                .first();

            if (existingCategory) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'A category with this slug already exists.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const [updatedCategory] = await db('categories')
                .where({ id })
                .update({
                    name,
                    slug,
                    content,
                    parent_id,
                    image_id,
                    status,
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

            return res.status(StatusCode.OK).json(transformResponse({
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
    } else {
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
