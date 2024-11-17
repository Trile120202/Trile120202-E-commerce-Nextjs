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
            db.raw('SUM(order_items.quantity) as total_quantity'),
            db.raw('COUNT(DISTINCT orders.id) as total_orders'),
            'products.name',
            'products.stock_quantity',
            'images.url as thumbnail',
            'categories.name as category_name',
            'categories.slug as category_slug'
        )
        .join('orders', 'orders.id', 'order_items.order_id')
        .join('products', 'products.id', 'order_items.product_id')
        .join('images', 'products.thumbnail_id', 'images.id')
        .leftJoin('product_categories', 'product_categories.product_id', 'products.id')
        .leftJoin('categories', 'categories.id', 'product_categories.category_id')
        .where('orders.status', 9)
        .whereRaw(periodClause)
        .groupBy('order_items.product_id', 'products.name', 'products.stock_quantity', 'images.url', 'categories.name', 'categories.slug')
        .orderBy('total_quantity', 'desc')
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

async function getTotalOrders(period: string, year: number, month?: number) {
    const periodClause = getPeriodClause(period, year, month);

    const result = await db('orders')
        .select(
            db.raw('COUNT(CASE WHEN status = 0 THEN 1 END) as pending_orders'),
            db.raw('COUNT(CASE WHEN status = 1 THEN 1 END) as processing_orders'),
            db.raw('COUNT(CASE WHEN status = 2 THEN 1 END) as confirmed_orders'),
            db.raw('COUNT(CASE WHEN status = 3 THEN 1 END) as shipping_orders'),
            db.raw('COUNT(CASE WHEN status = 4 THEN 1 END) as delivered_orders'),
            db.raw('COUNT(CASE WHEN status = 5 THEN 1 END) as cancelled_orders'),
            db.raw('COUNT(CASE WHEN status = 6 THEN 1 END) as refund_requested_orders'),
            db.raw('COUNT(CASE WHEN status = 7 THEN 1 END) as refunding_orders'),
            db.raw('COUNT(CASE WHEN status = 8 THEN 1 END) as refunded_orders'),
            db.raw('COUNT(CASE WHEN status = 9 THEN 1 END) as completed_orders'),
            db.raw('COUNT(*) as total_orders')
        )
        .whereRaw(periodClause)
        .first();

    return {
        pendingOrders: parseInt(result.pending_orders as string) || 0,
        processingOrders: parseInt(result.processing_orders as string) || 0,
        confirmedOrders: parseInt(result.confirmed_orders as string) || 0,
        shippingOrders: parseInt(result.shipping_orders as string) || 0,
        deliveredOrders: parseInt(result.delivered_orders as string) || 0,
        cancelledOrders: parseInt(result.cancelled_orders as string) || 0,
        refundRequestedOrders: parseInt(result.refund_requested_orders as string) || 0,
        refundingOrders: parseInt(result.refunding_orders as string) || 0,
        refundedOrders: parseInt(result.refunded_orders as string) || 0,
        completedOrders: parseInt(result.completed_orders as string) || 0,
        totalOrders: parseInt(result.total_orders as string) || 0
    };
}

async function getDeliverySuccessRate(period: string, year: number, month?: number) {
    const periodClause = getPeriodClause(period, year, month);

    const results = await db('orders')
        .select(
            db.raw('COUNT(CASE WHEN status = 9 THEN 1 END) as success_count'),
            db.raw('COUNT(CASE WHEN status = 5 THEN 1 END) as failed_count'),
            db.raw('COUNT(*) as total_count')
        )
        .whereIn('status', [5, 9])
        .whereRaw(periodClause)
        .first();

    const successRate = results.total_count > 0 
        ? (results.success_count / results.total_count) * 100 
        : 0;

    return Math.round(successRate * 100) / 100; 
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

            if (!['quarter1', 'quarter2', 'quarter3', 'quarter4', 'month', 'year'].includes(period)) {
                return res.status(StatusCode.BAD_REQUEST).json(transformResponse({
                    data: null,
                    message: 'Invalid period.',
                    statusCode: StatusCode.BAD_REQUEST,
                }));
            }

            const [revenue, orders, topSellingProducts, deliverySuccessRate] = await Promise.all([
                getRevenue(period, year, month),
                getTotalOrders(period, year, month),
                getTopSellingProducts(period, year, month),
                getDeliverySuccessRate(period, year, month)
            ]);

            res.status(StatusCode.OK).json(transformResponse({
                data: { 
                    revenue,
                    orders,
                    topSellingProducts,
                    deliverySuccessRate 
                },
                message: `Retrieved revenue, total orders and top-selling products for ${period} of ${year} successfully.`,
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
