import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import { useAuth } from '@/hooks/useAuth';

const db = knex(knexConfig);

function getPeriodClause(period: string, year: number, month?: number) {
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
            const selectedMonth = month ?? new Date().getMonth() + 1; 
            return `EXTRACT(MONTH FROM orders.created_at) = ${selectedMonth} AND EXTRACT(YEAR FROM orders.created_at) = ${year}`;
        case 'year':
            return `EXTRACT(YEAR FROM orders.created_at) = ${year}`;
        default:
            throw new Error('Invalid period');
    }
}



async function getTopSellingProducts(period: string, year: number, month?: number) {
    const periodClause = getPeriodClause(period, year, month);

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

async function getRevenue(period: string, year: number, month?: number) {
    const periodClause = getPeriodClause(period, year, month);

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
            const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;

            // Validate the period type
            if (!['quarter1', 'quarter2', 'quarter3', 'quarter4', 'month', 'year'].includes(period)) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Invalid period.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            // Fetch revenue and top-selling products concurrently
            const [revenue, topSellingProducts] = await Promise.all([
                getRevenue(period, year, month),
                getTopSellingProducts(period, year, month)
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
