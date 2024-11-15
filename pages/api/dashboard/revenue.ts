import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import { useAuth } from '@/hooks/useAuth';

const db = knex(knexConfig);

async function getTopSellingProducts(period: string) {
    const periodClause = {
        quarter: `EXTRACT(QUARTER FROM orders.created_at) = EXTRACT(QUARTER FROM CURRENT_DATE)`,
        month: `EXTRACT(MONTH FROM orders.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)`,
        year: `EXTRACT(YEAR FROM orders.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)`
    }[period];

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
        .whereRaw(periodClause || '')
        .groupBy('order_items.product_id', 'products.name', 'images.url', 'categories.name', 'categories.slug')
        .orderBy('count', 'desc')
        .limit(5);
}


async function getRevenue(period: string) {
    const periodClause = {
        quarter: `EXTRACT(QUARTER FROM created_at) = EXTRACT(QUARTER FROM CURRENT_DATE)`,
        month: `EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)`,
        year: `EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)`
    }[period];

    const revenue = await db('orders')
        .sum({ total: db.raw('CAST(total_amount AS numeric)') })
        .where('status', 9)
        .whereRaw(periodClause || '')
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
            const period = req.query.period as string || 'year';
            if (!['quarter', 'month', 'year'].includes(period)) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Invalid period.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const [revenue, topSellingProducts] = await Promise.all([
                getRevenue(period),
                getTopSellingProducts(period)
            ]);

            res.status(StatusCode.OK).json(transformResponse({
                data: { revenue, topSellingProducts },
                message: `Lấy doanh thu và top sản phẩm bán chạy nhất theo ${period} thành công.`,
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi lấy doanh thu và top sản phẩm bán chạy nhất.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    }
    
    
}
