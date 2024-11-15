import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import { useAuth } from '@/hooks/useAuth';

const db = knex(knexConfig);

async function getMonthlyRevenue(year: number) {
    const monthlyRevenue = await db('orders')
        .select(
            db.raw('EXTRACT(MONTH FROM created_at) as month'),
            db.raw('SUM(CAST(total_amount AS numeric)) as revenue')
        )
        .where('status', 9)
        .whereRaw(`EXTRACT(YEAR FROM created_at) = ?`, [year])
        .groupBy(db.raw('EXTRACT(MONTH FROM created_at)'))
        .orderBy('month');

    const revenueByMonth = Array(12).fill(0);

    monthlyRevenue.forEach(item => {
        const monthIndex = parseInt(item.month) - 1;
        revenueByMonth[monthIndex] = parseFloat(item.revenue);
    });

    return revenueByMonth;
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
            const year = parseInt(req.query.year as string) || new Date().getFullYear();
            
            const monthlyRevenue = await getMonthlyRevenue(year);

            res.status(StatusCode.OK).json(transformResponse({
                data: monthlyRevenue,
                message: `Retrieved monthly revenue for year ${year} successfully.`,
                statusCode: StatusCode.OK,
            }));

        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving monthly revenue data.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    }
}

