import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import { useAuth } from '@/hooks/useAuth';

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            // const verified = await useAuth(req, res);
            // if (!verified) {
            //     return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
            //         data: null,
            //         message: 'Unauthorized',
            //         statusCode: StatusCode.UNAUTHORIZED
            //     }));
            // }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const minPrice = parseInt(req.query.minPrice as string) || 0;
            let maxPrice = parseInt(req.query.maxPrice as string) || Number.MAX_SAFE_INTEGER;
            const categoryId = req.query.categoryId as string;
            let type = req.query.type as string;
            const status = parseInt(req.query.status as string);

            if (maxPrice === 100000000) {
                maxPrice = Number.MAX_SAFE_INTEGER;
            }
        
            let query = db('products as p')
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
                .leftJoin('order_items as oi', 'p.id', 'oi.product_id')
                .whereNot('p.status', -2)
                .modify(function(queryBuilder) {
                    if (typeof status !== 'undefined' && !isNaN(status)) {
                        queryBuilder.where('p.status', status);
                    }
                })
                .whereBetween('p.price', [minPrice, maxPrice])
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
                .groupBy('p.id', 'i.id');

            if (type) {
                if (type === 'hot') {
                    query = query
                        .select(db.raw('COUNT(DISTINCT oi.id) as order_count'))
                        .groupBy('p.id', 'i.id')
                        .orderBy('order_count', 'desc');
                } else if (type === 'gaming' || type === 'sinh-vien') {
                    if(type==='sinh-vien'){
                        type = 'sinh viên'
                    }
                    query = query.where('t.name', 'ilike', `%${type}%`);
                }
            }
        
            if (search) {
                query = query.where((builder) => {
                    builder.where('p.name', 'ilike', `%${search}%`)
                        .orWhere('t.name', 'ilike', `%${search}%`)
                        .orWhere('c.name', 'ilike', `%${search}%`);
                });
            }

            if (categoryId) {
                query = query.where('pc.category_id', categoryId);
            }
        
            let countQuery = db('products as p')
                .leftJoin('product_categories as pc', 'p.id', 'pc.product_id')
                .leftJoin('categories as c', 'pc.category_id', 'c.id')
                .leftJoin('product_tags as pt', 'p.id', 'pt.product_id')
                .leftJoin('tags as t', 'pt.tag_id', 't.id')
                .leftJoin('order_items as oi', 'p.id', 'oi.product_id')
                .whereNot('p.status', -2)
                .whereBetween('p.price', [minPrice, maxPrice]);

            if (type) {
                if (type === 'hot') {
                    countQuery = countQuery
                        .select(db.raw('COUNT(DISTINCT oi.id) as order_count'))
                        .groupBy('p.id');
                } else if (type === 'gaming' || type === 'van-phong') {
                    countQuery = countQuery.where('t.name', 'ilike', `%${type}%`);
                }
            }
        
            if (search) {
                countQuery = countQuery.where((builder) => {
                    builder.where('p.name', 'ilike', `%${search}%`)
                        .orWhere('t.name', 'ilike', `%${search}%`)
                        .orWhere('c.name', 'ilike', `%${search}%`);
                });
            }

            if (categoryId) {
                countQuery = countQuery.where('pc.category_id', categoryId);
            }
        
            const [countResult] = await countQuery.clone().count('* as total');
            const totalItems = parseInt(countResult.total as string, 10);
        
            const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 1;
        
            const adjustedPage = Math.min(page, totalPages);
            const adjustedOffset = (adjustedPage - 1) * limit;
        
            const products = await query
                .orderBy([
                    { column: type === 'hot' ? 'order_count' : 'p.created_at', order: 'desc' }
                ])
                .limit(limit)
                .offset(adjustedOffset);
        
            products.forEach((product: any) => {
                product.product_image_ids = product.product_image_ids || [];
                product.product_image_urls = product.product_image_urls || [];
                product.ram_ids = product.ram_ids || [];
                product.storage_ids = product.storage_ids || [];
                product.tag_ids = product.tag_ids || [];
                product.display_ids = product.display_ids || [];
                product.cpu_ids = product.cpu_ids || [];
                product.graphics_card_ids = product.graphics_card_ids || [];
            });
        
            res.status(StatusCode.OK).json(transformResponse({
                data: products,
                message: 'Products retrieved successfully.',
                statusCode: StatusCode.OK,
                pagination: {
                    currentPage: adjustedPage,
                    pageSize: limit,
                    totalItems,
                    totalPages,
                },
            }));
        
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving products.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
        
    } else if (req.method === 'POST') {
        try {
            const verified = await useAuth(req, res);
            if (!verified || verified.payload.roleName !== 'admin') {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'Unauthorized',
                    statusCode: StatusCode.UNAUTHORIZED
                }));
            }

            const { 
                name, 
                price, 
                stock_quantity, 
                description, 
                specifications, 
                categories,
                ram_ids,
                storage_ids,
                tag_ids,
                display_id,
                cpu_id,
                graphics_card_ids,
                status,
                thumbnail_id,
                images
            } = req.body;

            if (!name || !price || !stock_quantity || !description ) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Missing required fields',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            if (typeof price !== 'number' || price <= 0) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Invalid price',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            if (typeof stock_quantity !== 'number' || stock_quantity < 0) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Invalid stock quantity',
                    statusCode: StatusCode.BAD_REQUEST
                }));
            }

            const slug = name.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-');

            const trx = await db.transaction();

            try {
                const [product] = await trx('products')
                    .insert({
                        name,
                        slug,
                        price,
                        description,
                        specifications,
                        stock_quantity,
                        thumbnail_id,
                        status
                    })
                    .returning('*');

                if (categories && categories.length > 0) {
                    const categoryRecords = categories.map((categoryId: number) => ({
                        product_id: product.id,
                        category_id: categoryId
                    }));
                    await trx('product_categories').insert(categoryRecords);
                }

                if (images && images.length > 0) {
                    const imageRecords = images.map((imageId: number, index: number) => ({
                        product_id: product.id,
                        image_id: imageId,
                        display_order: index + 1
                    }));
                    await trx('product_images').insert(imageRecords);
                }

                if (ram_ids && ram_ids.length > 0) {
                    const ramRecords = ram_ids.map((ramId: number) => ({
                        product_id: product.id,
                        ram_id: ramId
                    }));
                    await trx('product_ram').insert(ramRecords);
                }

                if (storage_ids && storage_ids.length > 0) {
                    const storageRecords = storage_ids.map((storageId: number) => ({
                        product_id: product.id,
                        hard_id: storageId
                    }));
                    await trx('product_hard_drives').insert(storageRecords);
                }

                if (tag_ids && tag_ids.length > 0) {
                    const tagRecords = tag_ids.map((tagId: number) => ({
                        product_id: product.id,
                        tag_id: tagId
                    }));
                    await trx('product_tags').insert(tagRecords);
                }

                if (display_id) {
                    await trx('product_displays').insert({
                        product_id: product.id,
                        display_id: display_id
                    });
                }

                if (cpu_id) {
                    await trx('product_cpus').insert({
                        product_id: product.id,
                        cpu_id: cpu_id
                    });
                }

                if (graphics_card_ids && graphics_card_ids.length > 0) {
                    const graphicsCardRecords = graphics_card_ids.map((graphicsCardId: number) => ({
                        product_id: product.id,
                        graphics_card_id: graphicsCardId
                    }));
                    await trx('product_graphics_cards').insert(graphicsCardRecords);
                }

                await trx.commit();

                res.status(StatusCode.CREATED).json(transformResponse({
                    data: product,
                    message: 'Product created successfully.',
                    statusCode: StatusCode.CREATED
                }));
            } catch (error) {
                await trx.rollback();
                throw error;
            }
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while creating the product.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}
