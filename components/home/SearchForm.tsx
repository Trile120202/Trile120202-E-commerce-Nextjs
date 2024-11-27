'use client'

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useFetch from "@/lib/useFetch";

interface ApiResponse {
    status: number;
    message: string;
    data: {
        id: string;
        name: string;
    }[];
}

export default function SearchForm() {
    const { data: categoryData } = useFetch<ApiResponse>('/api/categories/all-category');
    const [searchParams, setSearchParams] = useState({
        name: '',
        category: '',
        minPrice: '0',
        maxPrice: '100000000'
    });
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        
        if (searchParams.name) {
            params.append('search', searchParams.name);
        }
        if (searchParams.category) {
            params.append('categoryId', searchParams.category); 
        }
        if (searchParams.minPrice) {
            params.append('minPrice', searchParams.minPrice);
        }
        if (searchParams.maxPrice) {
            params.append('maxPrice', searchParams.maxPrice);
        }

        router.push(`/san-pham?${params.toString()}`);
    };

    const handlePriceChange = (values: number[]) => {
        setSearchParams({
            ...searchParams,
            minPrice: (values[0] * 1000000).toString(),
            maxPrice: (values[1] * 1000000).toString()
        });
    };

    return (
        <form onSubmit={handleSearch} className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tên sản phẩm</label>
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchParams.name}
                        onChange={(e) => setSearchParams({...searchParams, name: e.target.value})}
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Danh mục</label>
                    <select 
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchParams.category}
                        onChange={(e) => setSearchParams({...searchParams, category: e.target.value})}
                    >
                        <option value="">Tất cả danh mục</option>
                        {categoryData?.data.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Khoảng giá (triệu VNĐ)</label>
                <div className="px-4">
                    <Slider
                        defaultValue={[0, 100]}
                        max={100}
                        step={1}
                        minStepsBetweenThumbs={1}
                        className="w-full"
                        onValueChange={handlePriceChange}
                    />
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span>{parseInt(searchParams.minPrice) / 1000000}tr</span>
                        <span>{parseInt(searchParams.maxPrice) / 1000000}tr</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 text-center">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-all duration-300">
                    Tìm kiếm
                </Button>
            </div>
        </form>
    );
} 