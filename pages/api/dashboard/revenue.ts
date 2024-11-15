import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
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
    if (req.method === 'GET') {
        try {
            const period = req.query.period as string || 'year';
            let revenue;
            let topSellingProducts;
    
            switch (period) {
                case 'quarter':
                    revenue = await db('orders')
                        .sum({ total: db.raw('CAST(total_amount AS numeric)') })
                        .where('status', 9)
                        .whereRaw('EXTRACT(QUARTER FROM created_at) = EXTRACT(QUARTER FROM CURRENT_DATE)')
                        .first();
                    topSellingProducts = await db('order_items')
                        .select('product_id', db.raw('COUNT(*) as count'))
                        .join('orders', 'orders.id', 'order_items.order_id')
                        .where('orders.status', 9)
                        .whereRaw('EXTRACT(QUARTER FROM orders.created_at) = EXTRACT(QUARTER FROM CURRENT_DATE)')
                        .groupBy('product_id')
                        .orderBy('count', 'desc')
                        .limit(5);
                    break;
                case 'month':
                    revenue = await db('orders')
                        .sum({ total: db.raw('CAST(total_amount AS numeric)') })
                        .where('status', 9)
                        .whereRaw('EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)')
                        .first();
                    topSellingProducts = await db('order_items')
                        .select('product_id', db.raw('COUNT(*) as count'))
                        .join('orders', 'orders.id', 'order_items.order_id')
                        .where('orders.status', 9)
                        .whereRaw('EXTRACT(MONTH FROM orders.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)')
                        .groupBy('product_id')
                        .orderBy('count', 'desc')
                        .limit(5);
                    break;
                case 'year':
                    revenue = await db('orders')
                        .sum({ total: db.raw('CAST(total_amount AS numeric)') })
                        .where('status', 9)
                        .whereRaw('EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)')
                        .first();
                    topSellingProducts = await db('order_items')
                        .select('product_id', db.raw('COUNT(*) as count'))
                        .join('orders', 'orders.id', 'order_items.order_id')
                        .where('orders.status', 9)
                        .whereRaw('EXTRACT(YEAR FROM orders.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)')
                        .groupBy('product_id')
                        .orderBy('count', 'desc')
                        .limit(5);
                    break;
                default:
                    return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                        data: null,
                        message: 'Invalid period.',
                        statusCode: StatusCode.BAD_REQUEST,
                    }));
            }
    
            if (revenue && revenue.total) {
                revenue.total = parseFloat(revenue.total);
            }
    
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
