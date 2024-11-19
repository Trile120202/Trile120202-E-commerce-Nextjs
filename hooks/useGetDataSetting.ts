import { useState, useEffect } from 'react';
import { transformResponse } from '@/lib/interceptors/transformInterceptor';

interface SettingResponse {
    id: number;
    name: string;
    value: string;
    status: number;
    created_at: string;
    updated_at: string;
}

export const useGetDataSetting = (name: string) => {
    const [data, setData] = useState<SettingResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!name) return;
            
            setIsLoading(true);
            try {
                const response = await fetch(`/api/settings/${name}`);
                const result = await response.json();
                setData(result.data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An error occurred'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [name]);

    return { data, error, isLoading };
};
