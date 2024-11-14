import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const period = req.query.period as string || 'year';
            let revenue;

            switch (period) {
                case 'quarter':
                    revenue = await db('orders')
                        .sum({ total: db.raw('CAST(total_amount AS numeric)') })
                        .where('status', 1)
                        .whereRaw('EXTRACT(QUARTER FROM created_at) = EXTRACT(QUARTER FROM CURRENT_DATE)')
                        .first();
                    break;
                case 'month':
                    revenue = await db('orders')
                        .sum({ total: db.raw('CAST(total_amount AS numeric)') })
                        .where('status', 1)
                        .whereRaw('EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)')
                        .first();
                    break;
                case 'year':
                    revenue = await db('orders')
                        .sum({ total: db.raw('CAST(total_amount AS numeric)') })
                        .where('status', 1)
                        .whereRaw('EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)')
                        .first();
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
                data: revenue,
                message: `Lấy doanh thu theo ${period} thành công.`,
                statusCode: StatusCode.OK,
            }));
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi lấy doanh thu.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else {
        return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
            data: null,
            message: 'Method not allowed',
            statusCode: StatusCode.METHOD_NOT_ALLOWED
        }));
    }
}
