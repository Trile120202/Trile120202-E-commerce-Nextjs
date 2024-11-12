import useSWR from 'swr';
import { StatusCode } from '@/lib/statusCodes';

interface PaymentMethod {
    id: number;
    name: string;
    code: string;
    description: string;
    is_active: boolean;
    icon_url: string;
    provider: string;
    config: any;
    created_at: string;
    updated_at: string;
    status: number;
}

interface PaymentMethodResponse {
    data: PaymentMethod[];
    message: string;
    statusCode: StatusCode;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const usePaymentMethods = () => {
    const { data, error, mutate } = useSWR<PaymentMethodResponse>(
        '/api/payment-method',
        fetcher
    );

    return {
        paymentMethods: data?.data ?? [],
        isLoading: !error && !data,
        isError: error,
        mutate
    };
};
