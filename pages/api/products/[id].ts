import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const product = await db('products as p')
                .leftJoin('images as i', 'p.thumbnail_id', 'i.id')
                .leftJoin('product_categories as pc', 'p.id', 'pc.product_id')
                .leftJoin('categories as c', 'pc.category_id', 'c.id')
                .leftJoin('product_images as pi', 'p.id', 'pi.product_id')
                .leftJoin('images as i2', 'pi.image_id', 'i2.id')
                .where('p.id', id)
                .where('p.status', '!=', -2)
                .select(
                    'p.id AS product_id',
                    'p.name AS product_name',
                    'p.price',
                    'p.slug',
                    'p.description',
                    'p.specifications',
                    'p.stock_quantity',
                    'p.created_at AS product_created_at',
                    'p.updated_at AS product_updated_at',
                    'p.status AS product_status',
                    'i.id AS thumbnail_id',
                    'i.url AS thumbnail_url',
                    'i.alt_text AS thumbnail_alt_text',
                    db.raw('STRING_AGG(DISTINCT c.name, \', \') AS categories'),
                    db.raw('ARRAY_AGG(DISTINCT pi.image_id) AS product_image_ids'),
                    db.raw('ARRAY_AGG(DISTINCT i2.url) AS product_image_urls')
                )
                .groupBy('p.id', 'i.id')
                .first();

            if (!product) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Product not found.',
                    statusCode: StatusCode.NOT_FOUND,
                }));
            }

            res.status(StatusCode.OK).json(transformResponse({
                data: product,
                message: 'Product retrieved successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving the product.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'PUT') {
        try {
            const { name, price, stock_quantity, description, specifications, categories, status, thumbnail_id, images } = req.body;

            if (!name || !price || !stock_quantity || !description || !categories || !thumbnail_id || !images) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Required fields are missing.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            if (name.length > 255) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Product name exceeds maximum length of 255 characters.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            // Validate numeric fields
            if (isNaN(price) || price < 0 || !Number.isInteger(Number(stock_quantity)) || stock_quantity < 0) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Invalid price or stock quantity.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            const trx = await db.transaction();

            try {
                const [updatedProduct] = await trx('products')
                    .where({ id })
                    .update({
                        name,
                        slug,
                        price,
                        stock_quantity,
                        description,
                        specifications,
                        thumbnail_id,
                        status,
                        updated_at: trx.fn.now(),
                    })
                    .returning('*');

                if (!updatedProduct) {
                    await trx.rollback();
                    return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                        data: null,
                        message: 'Product not found.',
                        statusCode: StatusCode.NOT_FOUND,
                    }));
                }

                // Update product categories
                await trx('product_categories').where({ product_id: id }).del();
                await trx('product_categories').insert(
                    categories.map((category_id: number) => ({
                        product_id: id,
                        category_id
                    }))
                );

                // Update product images
                await trx('product_images').where({ product_id: id }).del();
                await trx('product_images').insert(
                    images.map((image_id: number, index: number) => ({
                        product_id: id,
                        image_id,
                        display_order: index + 1
                    }))
                );

                await trx.commit();

                const updatedProductWithDetails = await db('products as p')
                    .leftJoin('images as i', 'p.thumbnail_id', 'i.id')
                    .leftJoin('product_categories as pc', 'p.id', 'pc.product_id')
                    .leftJoin('categories as c', 'pc.category_id', 'c.id')
                    .leftJoin('product_images as pi', 'p.id', 'pi.product_id')
                    .leftJoin('images as i2', 'pi.image_id', 'i2.id')
                    .where('p.id', id)
                    .select(
                        'p.id AS product_id',
                        'p.name AS product_name',
                        'p.price',
                        'p.slug',
                        'p.description',
                        'p.specifications',
                        'p.stock_quantity',
                        'p.created_at AS product_created_at',
                        'p.updated_at AS product_updated_at',
                        'p.status AS product_status',
                        'i.id AS thumbnail_id',
                        'i.url AS thumbnail_url',
                        'i.alt_text AS thumbnail_alt_text',
                        db.raw('STRING_AGG(DISTINCT c.name, \', \') AS categories'),
                        db.raw('ARRAY_AGG(DISTINCT pi.image_id) AS product_image_ids'),
                        db.raw('ARRAY_AGG(DISTINCT i2.url) AS product_image_urls')
                    )
                    .groupBy('p.id', 'i.id')
                    .first();

                return res.status(StatusCode.OK).json(transformResponse({
                    data: updatedProductWithDetails,
                    message: 'Product updated successfully.',
                    statusCode: StatusCode.OK,
                }));
            } catch (error) {
                await trx.rollback();
                throw error;
            }
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while updating the product.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
