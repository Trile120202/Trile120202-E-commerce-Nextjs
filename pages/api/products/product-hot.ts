import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
            data: null,
            message: 'Method Not Allowed',
            statusCode: StatusCode.METHOD_NOT_ALLOWED
        }));
    }

    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 8;
        const offset = (page - 1) * limit;

        const countQuery = await db('products as p')
            .leftJoin('order_items as oi', 'p.id', 'oi.product_id')
            .leftJoin('orders as o', 'oi.order_id', 'o.id')
            .where('p.status', 1)
            .whereRaw("o.created_at >= NOW() - INTERVAL '30 days'")
            .count('* as total')
            .first();

        const totalItems = parseInt(countQuery?.total as string) || 0;
        const totalPages = Math.ceil(totalItems / limit);

        const hotProducts = await db('products as p')
            .leftJoin('images as i', 'p.thumbnail_id', 'i.id')
            .leftJoin('order_items as oi', 'p.id', 'oi.product_id')
            .leftJoin('orders as o', 'oi.order_id', 'o.id')
            .leftJoin('product_categories as pc', 'p.id', 'pc.product_id')
            .leftJoin('categories as c', 'pc.category_id', 'c.id')
            .leftJoin('product_images as pi', 'p.id', 'pi.product_id')
            .leftJoin('images as product_images', 'pi.image_id', 'product_images.id')
            .leftJoin('product_ram as pr', 'p.id', 'pr.product_id')
            .leftJoin('ram as r', 'pr.ram_id', 'r.id')
            .leftJoin('product_hard_drives as ps', 'p.id', 'ps.product_id')
            .leftJoin('hard_drives as s', 'ps.hard_id', 's.id')
            .leftJoin('product_tags as pt', 'p.id', 'pt.product_id')
            .leftJoin('tags as t', 'pt.tag_id', 't.id')
            .where('p.status', 1)
            .whereRaw("o.created_at >= NOW() - INTERVAL '30 days'")
            .select(
                'p.id as product_id',
                'p.name as product_name',
                'p.price',
                'p.slug',
                'p.description',
                'p.specifications',
                'p.stock_quantity',
                'p.created_at',
                'p.updated_at',
                'p.status',
                'i.url as thumbnail_url',
                'i.alt_text as thumbnail_alt_text',
                db.raw('array_agg(DISTINCT c.name) as categories'),
                db.raw('array_agg(DISTINCT product_images.id) as product_image_ids'),
                db.raw('array_agg(DISTINCT product_images.url) as product_image_urls'),
                db.raw('array_agg(DISTINCT r.name) as ram_names'),
                db.raw('array_agg(DISTINCT r.id) as ram_ids'),
                db.raw('array_agg(DISTINCT s.name) as storage_names'),
                db.raw('array_agg(DISTINCT s.id) as storage_ids'),
                db.raw('array_agg(DISTINCT t.name) as tags'),
                db.raw('array_agg(DISTINCT t.id) as tag_ids'),
                db.raw('COUNT(oi.product_id) as order_count')
            )
            .groupBy('p.id', 'i.url', 'i.alt_text')
            .orderBy('order_count', 'desc')
            .offset(offset)
            .limit(limit);

        const cleanedProducts = hotProducts.map(product => ({
            ...product,
            categories: product.categories[0] === null ? null : product.categories,
            product_image_ids: product.product_image_ids[0] === null ? [] : product.product_image_ids,
            product_image_urls: product.product_image_urls[0] === null ? [] : product.product_image_urls,
            ram_names: product.ram_names[0] === null ? null : product.ram_names,
            ram_ids: product.ram_ids[0] === null ? [] : product.ram_ids,
            storage_names: product.storage_names[0] === null ? null : product.storage_names,
            storage_ids: product.storage_ids[0] === null ? [] : product.storage_ids,
            tags: product.tags[0] === null ? null : product.tags,
            tag_ids: product.tag_ids[0] === null ? [] : product.tag_ids
        }));

        return res.status(StatusCode.OK).json(transformResponse({
            data: cleanedProducts,
            message: 'Hot products retrieved successfully',
            statusCode: StatusCode.OK,
            pagination: {
                currentPage: page,
                pageSize: limit,
                totalItems: totalItems,
                totalPages: totalPages
            }
        }));

    } catch (error) {
        console.error('Error fetching hot products:', error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
            data: null,
            message: 'An error occurred while retrieving hot products',
            statusCode: StatusCode.INTERNAL_SERVER_ERROR
        }));
    }
}
