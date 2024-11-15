import { NextApiRequest, NextApiResponse } from 'next';
import { jwtVerify } from 'jose';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";

export async function useAuth(req: NextApiRequest, res: NextApiResponse) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
            data: null,
            message: 'Unauthorized - No token provided',
            statusCode: StatusCode.UNAUTHORIZED
        }));
    }

    try {
        const verified = await jwtVerify(
            token as string,
            new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
        );

        return verified;
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(StatusCode.UNAUTHORIZED).json(transformResponse({
            data: null,
            message: 'Unauthorized - Invalid token',
            statusCode: StatusCode.UNAUTHORIZED
        }));
    }
} 