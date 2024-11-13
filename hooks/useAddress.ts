import { useState, useEffect } from 'react';

interface DeliveryAddress {
    id: number;
    province_code: string;
    district_code: string;
    ward_code: string;
    address: string;
    status: number;
    province_name: string;
    district_name: string;
    ward_name: string;
}

interface AddressResponse {
    data: DeliveryAddress | null;
    message: string;
    statusCode: number;
}

export const useAddress = (id: string | number) => {
    const [address, setAddress] = useState<DeliveryAddress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAddress = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/delivery-addresses/${id}`);
                const result: AddressResponse = await response.json();

                if (response.ok) {
                    setAddress(result.data);
                    setError(null);
                } else {
                    setError(result.message);
                    setAddress(null);
                }
            } catch (err) {
                setError('Đã xảy ra lỗi khi lấy thông tin địa chỉ giao hàng');
                setAddress(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAddress();
        }
    }, [id]);

    return {
        address,
        loading,
        error
    };
};
