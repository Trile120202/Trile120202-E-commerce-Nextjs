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
                .leftJoin('product_ram as pr', 'p.id', 'pr.product_id')
                .leftJoin('ram as r', 'pr.ram_id', 'r.id')
                .leftJoin('product_hard_drives as phd', 'p.id', 'phd.product_id')
                .leftJoin('hard_drives as s', 'phd.hard_id', 's.id')
                .leftJoin('product_tags as pt', 'p.id', 'pt.product_id')
                .leftJoin('tags as t', 'pt.tag_id', 't.id')
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
                    db.raw('ARRAY_AGG(DISTINCT c.id) FILTER (WHERE c.id IS NOT NULL) AS category_ids'),
                    db.raw('ARRAY_AGG(DISTINCT pi.image_id) FILTER (WHERE pi.image_id IS NOT NULL) AS product_image_ids'),
                    db.raw('ARRAY_AGG(DISTINCT i2.url) FILTER (WHERE i2.url IS NOT NULL) AS product_image_urls'),
                    db.raw('STRING_AGG(DISTINCT r.name, \', \') AS ram_names'),
                    db.raw('ARRAY_AGG(DISTINCT r.id) FILTER (WHERE r.id IS NOT NULL) AS ram_ids'),
                    db.raw('STRING_AGG(DISTINCT s.name, \', \') AS storage_names'),
                    db.raw('ARRAY_AGG(DISTINCT s.id) FILTER (WHERE s.id IS NOT NULL) AS storage_ids'),
                    db.raw('STRING_AGG(DISTINCT t.name, \', \') AS tags'),
                    db.raw('ARRAY_AGG(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL) AS tag_ids')
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

            // Convert null arrays to empty arrays
            product.product_image_ids = product.product_image_ids || [];
            product.product_image_urls = product.product_image_urls || [];
            product.ram_ids = product.ram_ids || [];
            product.storage_ids = product.storage_ids || [];
            product.tag_ids = product.tag_ids || [];
            product.category_ids = product.category_ids || [];

            res.status(StatusCode.OK).json(transformResponse({
                data: product,
                message: 'Product retrieved successfully.',
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error('Error retrieving product:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                status: 500,
                message: "An error occurred while retrieving the product.",
                data: null
            });
        }
    } else if (req.method === 'PUT') {
        try {
            const { name, price, stock_quantity, description, specifications, categories, status, thumbnail_id, images, ram_ids, storage_ids, tag_ids } = req.body;

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

                // Update product RAM
                await trx('product_ram').where({ product_id: id }).del();
                if (ram_ids && ram_ids.length > 0) {
                    await trx('product_ram').insert(
                        ram_ids.map((ram_id: number) => ({
                            product_id: id,
                            ram_id
                        }))
                    );
                }

                // Update product storage
                await trx('product_hard_drives').where({ product_id: id }).del();
                if (storage_ids && storage_ids.length > 0) {
                    await trx('product_hard_drives').insert(
                        storage_ids.map((hard_id: number) => ({
                            product_id: id,
                            hard_id
                        }))
                    );
                }

                // Update product tags
                await trx('product_tags').where({ product_id: id }).del();
                if (tag_ids && tag_ids.length > 0) {
                    await trx('product_tags').insert(
                        tag_ids.map((tag_id: number) => ({
                            product_id: id,
                            tag_id
                        }))
                    );
                }

                await trx.commit();

                const updatedProductWithDetails = await db('products as p')
                    .leftJoin('images as i', 'p.thumbnail_id', 'i.id')
                    .leftJoin('product_categories as pc', 'p.id', 'pc.product_id')
                    .leftJoin('categories as c', 'pc.category_id', 'c.id')
                    .leftJoin('product_images as pi', 'p.id', 'pi.product_id')
                    .leftJoin('images as i2', 'pi.image_id', 'i2.id')
                    .leftJoin('product_ram as pr', 'p.id', 'pr.product_id')
                    .leftJoin('ram as r', 'pr.ram_id', 'r.id')
                    .leftJoin('product_hard_drives as phd', 'p.id', 'phd.product_id')
                    .leftJoin('hard_drives as s', 'phd.hard_id', 's.id')
                    .leftJoin('product_tags as pt', 'p.id', 'pt.product_id')
                    .leftJoin('tags as t', 'pt.tag_id', 't.id')
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
                        db.raw('ARRAY_AGG(DISTINCT c.id) FILTER (WHERE c.id IS NOT NULL) AS category_ids'),
                        db.raw('ARRAY_AGG(DISTINCT pi.image_id) FILTER (WHERE pi.image_id IS NOT NULL) AS product_image_ids'),
                        db.raw('ARRAY_AGG(DISTINCT i2.url) FILTER (WHERE i2.url IS NOT NULL) AS product_image_urls'),
                        db.raw('STRING_AGG(DISTINCT r.name, \', \') AS ram_names'),
                        db.raw('ARRAY_AGG(DISTINCT r.id) FILTER (WHERE r.id IS NOT NULL) AS ram_ids'),
                        db.raw('STRING_AGG(DISTINCT s.name, \', \') AS storage_names'),
                        db.raw('ARRAY_AGG(DISTINCT s.id) FILTER (WHERE s.id IS NOT NULL) AS storage_ids'),
                        db.raw('STRING_AGG(DISTINCT t.name, \', \') AS tags'),
                        db.raw('ARRAY_AGG(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL) AS tag_ids')
                    )
                    .groupBy('p.id', 'i.id')
                    .first();

                // Convert null arrays to empty arrays
                updatedProductWithDetails.product_image_ids = updatedProductWithDetails.product_image_ids || [];
                updatedProductWithDetails.product_image_urls = updatedProductWithDetails.product_image_urls || [];
                updatedProductWithDetails.ram_ids = updatedProductWithDetails.ram_ids || [];
                updatedProductWithDetails.storage_ids = updatedProductWithDetails.storage_ids || [];
                updatedProductWithDetails.tag_ids = updatedProductWithDetails.tag_ids || [];
                updatedProductWithDetails.category_ids = updatedProductWithDetails.category_ids || [];

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
            console.error('Error updating product:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                status: 500,
                message: "An error occurred while retrieving the product.",
                data: null
            });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
