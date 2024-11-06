import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import knexConfig from "@/knexfile";

const db = knex(knexConfig);


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { slug } = req.query;

    if (req.method === 'GET') {
        try {
            const product = await db('products as p')
                .leftJoin('images as i', 'p.thumbnail_id', 'i.id')
                .leftJoin('product_categories as pc', 'p.id', 'pc.product_id')
                .leftJoin('categories as c', 'pc.category_id', 'c.id')
                .leftJoin('product_images as pi', 'p.id', 'pi.product_id')
                .leftJoin('images as i2', 'pi.image_id', 'i2.id')
                .where('p.slug', slug)
                .andWhere('p.status', 1)
                .select(
                    'p.id AS product_id',
                    'p.name AS product_name',
                    'p.brand',
                    'p.model',
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
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
