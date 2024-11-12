import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const { slug } = req.query;

            if (!slug) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Slug parameter is required',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

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
                .leftJoin('product_displays as pd', 'p.id', 'pd.product_id')
                .leftJoin('displays as d', 'pd.display_id', 'd.id')
                .leftJoin('product_cpus as pc2', 'p.id', 'pc2.product_id')
                .leftJoin('cpus as cpu', 'pc2.cpu_id', 'cpu.id')
                .leftJoin('product_graphics_cards as pgc', 'p.id', 'pgc.product_id')
                .leftJoin('graphics_cards as gc', 'pgc.graphics_card_id', 'gc.id')
                .where('p.slug', slug)
                .select(
                    'p.*',
                    'i.url as thumbnail_url',
                    db.raw('ARRAY_AGG(DISTINCT c.id) FILTER (WHERE c.id IS NOT NULL) AS category_ids'),
                    db.raw('STRING_AGG(DISTINCT c.name, \', \') AS category_names'),
                    db.raw('ARRAY_AGG(DISTINCT pi.image_id) FILTER (WHERE pi.image_id IS NOT NULL) AS product_image_ids'),
                    db.raw('ARRAY_AGG(DISTINCT i2.url) FILTER (WHERE i2.url IS NOT NULL) AS product_image_urls'),
                    db.raw('STRING_AGG(DISTINCT r.name, \', \') AS ram_names'),
                    db.raw('ARRAY_AGG(DISTINCT r.id) FILTER (WHERE r.id IS NOT NULL) AS ram_ids'),
                    db.raw('STRING_AGG(DISTINCT s.name, \', \') AS storage_names'),
                    db.raw('ARRAY_AGG(DISTINCT s.id) FILTER (WHERE s.id IS NOT NULL) AS storage_ids'),
                    db.raw('STRING_AGG(DISTINCT t.name, \', \') AS tags'),
                    db.raw('ARRAY_AGG(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL) AS tag_ids'),
                    db.raw('STRING_AGG(DISTINCT d.name, \', \') AS display_names'),
                    db.raw('ARRAY_AGG(DISTINCT d.id) FILTER (WHERE d.id IS NOT NULL) AS display_ids'),
                    db.raw('STRING_AGG(DISTINCT cpu.name, \', \') AS cpu_names'),
                    db.raw('ARRAY_AGG(DISTINCT cpu.id) FILTER (WHERE cpu.id IS NOT NULL) AS cpu_ids'),
                    db.raw('STRING_AGG(DISTINCT gc.name, \', \') AS graphics_card_names'),
                    db.raw('ARRAY_AGG(DISTINCT gc.id) FILTER (WHERE gc.id IS NOT NULL) AS graphics_card_ids')
                )
                .groupBy('p.id', 'i.url')
                .first();

            if (!product) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Product not found',
                    statusCode: StatusCode.NOT_FOUND
                }));
            }

            product.product_image_ids = product.product_image_ids || [];
            product.product_image_urls = product.product_image_urls || [];
            product.ram_ids = product.ram_ids || [];
            product.storage_ids = product.storage_ids || [];
            product.tag_ids = product.tag_ids || [];
            product.category_ids = product.category_ids || [];
            product.display_ids = product.display_ids || [];
            product.cpu_ids = product.cpu_ids || [];
            product.graphics_card_ids = product.graphics_card_ids || [];

            return res.status(StatusCode.OK).json(transformResponse({
                data: product,
                message: 'Product retrieved successfully',
                statusCode: StatusCode.OK
            }));

        } catch (error) {
            console.error('Error retrieving product:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving the product',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR
            }));
        }
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
