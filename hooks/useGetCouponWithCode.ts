import { useState, useEffect } from 'react';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: string;
  start_date: string;
  end_date: string;
  min_purchase_amount: string;
  max_usage: number;
  max_discount_value: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  status: number;
}

interface CouponResponse {
  status: number;
  message: string;
  data: Coupon;
}

export const useGetCouponWithCode = (code: string) => {
  const [data, setData] = useState<Coupon | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!code) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/coupons/code/${code}`);
        const result: CouponResponse = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [code]);

  return { data, error, isLoading };
};

