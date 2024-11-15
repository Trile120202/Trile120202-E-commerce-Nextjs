import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import { useAuth } from '@/hooks/useAuth';

const db = knex(knexConfig);

function getPeriodClause(period: string, year: number) {
    switch (period) {
        case 'quarter1':
            return `EXTRACT(QUARTER FROM orders.created_at) = 1 AND EXTRACT(YEAR FROM orders.created_at) = ${year}`;
        case 'quarter2':
            return `EXTRACT(QUARTER FROM orders.created_at) = 2 AND EXTRACT(YEAR FROM orders.created_at) = ${year}`;
        case 'quarter3':
            return `EXTRACT(QUARTER FROM orders.created_at) = 3 AND EXTRACT(YEAR FROM orders.created_at) = ${year}`;
        case 'quarter4':
            return `EXTRACT(QUARTER FROM orders.created_at) = 4 AND EXTRACT(YEAR FROM orders.created_at) = ${year}`;
        case 'month':
            return `EXTRACT(MONTH FROM orders.created_at) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM orders.created_at) = ${year}`;
        case 'year':
            return `EXTRACT(YEAR FROM orders.created_at) = ${year}`;
        default:
            throw new Error('Invalid period');
    }
}

async function getTopSellingProducts(period: string, year: number) {
    const periodClause = getPeriodClause(period, year);

    return db('order_items')
        .select(
            'order_items.product_id',
            db.raw('COUNT(*) as count'),
            'products.name',
            'images.url as thumbnail',
            'categories.name as category_name',
            'categories.slug as category_slug'
        )
        .join('orders', 'orders.id', 'order_items.order_id')
        .join('products', 'products.id', 'order_items.product_id')
        .join('product_images', 'product_images.product_id', 'products.id')
        .join('images', 'images.id', 'product_images.image_id')
        .leftJoin('product_categories', 'product_categories.product_id', 'products.id')
        .leftJoin('categories', 'categories.id', 'product_categories.category_id')
        .where('orders.status', 9)
        .whereRaw(periodClause)
        .groupBy('order_items.product_id', 'products.name', 'images.url', 'categories.name', 'categories.slug')
        .orderBy('count', 'desc')
        .limit(5);
}

async function getRevenue(period: string, year: number) {
    const periodClause = getPeriodClause(period, year);

    const revenue = await db('orders')
        .sum({ total: db.raw('CAST(total_amount AS numeric)') })
        .where('status', 9)
        .whereRaw(periodClause)
        .first();
    
    return revenue ? { total: parseFloat(revenue.total) } : { total: 0 };
}

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
            const period = (req.query.period as string) || 'year';
            const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();

            if (!['quarter1', 'quarter2', 'quarter3', 'quarter4', 'month', 'year'].includes(period)) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Invalid period.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const [revenue, topSellingProducts] = await Promise.all([
                getRevenue(period, year),
                getTopSellingProducts(period, year)
            ]);

            res.status(StatusCode.OK).json(transformResponse({
                data: { revenue, topSellingProducts },
                message: `Retrieved revenue and top-selling products for ${period} of ${year} successfully.`,
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving revenue and top-selling products.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    }
}
