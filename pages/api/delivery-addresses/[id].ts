import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const deliveryAddress = await db('delivery_addresses as da')
                .select(
                    'da.*',
                    'p.name as province_name',
                    'd.name as district_name',
                    'w.name as ward_name'
                )
                .leftJoin('provinces as p', 'da.province_code', 'p.code')
                .leftJoin('districts as d', 'da.district_code', 'd.code')
                .leftJoin('wards as w', 'da.ward_code', 'w.code')
                .where({ 'da.id': id, 'da.status': 1 })
                .first();

            if (!deliveryAddress) {
                return res.status(StatusCode.NOT_FOUND).json(transformResponse({
                    data: null,
                    message: 'Không tìm thấy địa chỉ giao hàng',
                    statusCode: StatusCode.NOT_FOUND
                }));
            }

            return res.status(StatusCode.OK).json(transformResponse({
                data: deliveryAddress,
                message: 'Lấy thông tin địa chỉ giao hàng thành công',
                statusCode: StatusCode.OK
            }));

        } catch (error) {
            console.error('Lỗi khi lấy thông tin địa chỉ giao hàng:', error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'Đã xảy ra lỗi khi lấy thông tin địa chỉ giao hàng',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR
            }));
        }
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).json(transformResponse({
            data: null,
            message: `Phương thức ${req.method} không được hỗ trợ`,
            statusCode: StatusCode.METHOD_NOT_ALLOWED
        }));
    }
}
