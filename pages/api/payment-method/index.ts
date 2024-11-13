import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";
import { jwtVerify } from "jose";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const token = req.cookies.token;

            if (!token) {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'Unauthorized - No token provided',
                    statusCode: StatusCode.UNAUTHORIZED
                }));
            }

            const paymentMethods = await db('payment_methods')
                .where('status', 1)
                .select('*')
                .orderBy('created_at', 'desc');

            res.status(StatusCode.OK).json(transformResponse({
                data: paymentMethods,
                message: 'Payment methods retrieved successfully.',
                statusCode: StatusCode.OK
            }));

        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while retrieving payment methods.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            }));
        }
    } else if (req.method === 'POST') {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'Unauthorized - No token provided',
                    statusCode: StatusCode.UNAUTHORIZED
                }));
            }

            const verified = await jwtVerify(
                token as string,
                new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
            );

            if (!token || verified.payload.roleName !== "admin") {
                return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
                    data: null,
                    message: 'Unauthorized - Admin access required',
                    statusCode: StatusCode.UNAUTHORIZED
                }));
            }

            const { 
                name,
                code,
                description,
                is_active,
                icon_url,
                provider,
                config
            } = req.body;

            const [paymentMethod] = await db('payment_methods')
                .insert({
                    name,
                    code,
                    description,
                    is_active,
                    icon_url,
                    provider,
                    config
                })
                .returning('*');

            res.status(StatusCode.CREATED).json(transformResponse({
                data: paymentMethod,
                message: 'Payment method created successfully.',
                statusCode: StatusCode.CREATED
            }));

        } catch (error) {
            console.error(error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
                data: null,
                message: 'An error occurred while creating the payment method.',
                statusCode: StatusCode.INTERNAL_SERVER_ERROR
            }));
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
    }
}

