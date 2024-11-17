'use client'
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
    id: string;
    name: string;
    // ... other category properties
}

interface SearchFormProps {
    categoryData?: {
        data: Category[];
    };
}

export default function SearchForm({ categoryData }: SearchFormProps) {
    const [searchParams, setSearchParams] = useState({
        name: '',
        category: '',
        minPrice: '',
        maxPrice: ''
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

    return (
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full px-4 py-3 rounded-lg bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500"
                    value={searchParams.name}
                    onChange={(e) => setSearchParams({...searchParams, name: e.target.value})}
                />
                <select 
                    className="w-full px-4 py-3 rounded-lg bg-white/90 backdrop-blur-sm text-gray-800"
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
                <input
                    type="number"
                    placeholder="Giá từ"
                    className="w-full px-4 py-3 rounded-lg bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500"
                    value={searchParams.minPrice}
                    onChange={(e) => setSearchParams({...searchParams, minPrice: e.target.value})}
                />
                <input
                    type="number"
                    placeholder="Giá đến"
                    className="w-full px-4 py-3 rounded-lg bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500"
                    value={searchParams.maxPrice}
                    onChange={(e) => setSearchParams({...searchParams, maxPrice: e.target.value})}
                />
            </div>
            <Button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-all duration-300">
                Tìm kiếm ngay
            </Button>
        </form>
    );
} 