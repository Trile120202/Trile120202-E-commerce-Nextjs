'use client'
import Carousel from '../../components/Carousel';
import CategoryHome from '@/components/home/CategoryHome';
import SectionProductHome from "@/components/home/SectionProductHome";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useFetch from "@/lib/useFetch";

interface Category {
    id: string;
    name: string;
    slug: string;
    content: string;
    image_id: string | null;
    created_at: string;
    updated_at: string;
    status: number;
    image_url: string | null;
    image_alt_text: string | null;
}

interface ApiResponse {
    status: number;
    message: string;
    data: Category[];
}

export default function Home() {
    const [searchParams, setSearchParams] = useState({
        name: '',
        category: '',
        minPrice: '',
        maxPrice: ''
    });
    const router = useRouter();
    const { data: categoryData } = useFetch<ApiResponse>('/api/categories/all-category');

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
        <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="flex-grow">
                {/* Hero Section with Carousel */}
                <section className="relative">
                    <Carousel location="home" position="1" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
                        <div className="text-center text-white w-full max-w-4xl px-4">
                            <h1 className="text-4xl md:text-6xl font-bold mb-4">Z-Shop</h1>
                            <p className="text-xl mb-6">Khám phá bộ sưu tập mới nhất của chúng tôi</p>
                            
                            <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-md p-6 rounded-lg ">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Tên sản phẩm"
                                        className="w-full px-4 py-2 rounded text-gray-800"
                                        value={searchParams.name}
                                        onChange={(e) => setSearchParams({...searchParams, name: e.target.value})}
                                    />
                                    <select 
                                        className="w-full px-4 py-2 rounded text-gray-800"
                                        value={searchParams.category}
                                        onChange={(e) => setSearchParams({...searchParams, category: e.target.value})}
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categoryData?.data.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Giá tối thiểu"
                                        className="w-full px-4 py-2 rounded text-gray-800"
                                        value={searchParams.minPrice}
                                        onChange={(e) => setSearchParams({...searchParams, minPrice: e.target.value})}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Giá tối đa"
                                        className="w-full px-4 py-2 rounded text-gray-800"
                                        value={searchParams.maxPrice}
                                        onChange={(e) => setSearchParams({...searchParams, maxPrice: e.target.value})}
                                    />
                                </div>
                                <Button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg">
                                    Tìm kiếm
                                </Button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Categories Section */}
                <section className="container mx-auto px-4 py-12">
                    <h2 className="text-3xl font-bold text-center mb-8">Danh mục sản phẩm</h2>
                    <CategoryHome />
                </section>

                {/* Featured Products Section */}
                <section className="container mx-auto px-4 py-12 bg-white">
                    <h2 className="text-3xl font-bold text-center mb-8">Sản phẩm nổi bật</h2>
                    <SectionProductHome />
                </section>

                {/* Benefits Section */}
                <section className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="text-center p-6 bg-white rounded-lg shadow-md">
                            <div className="text-4xl mb-4">⚡️</div>
                            <h3 className="text-xl font-semibold mb-2">Thanh toán an toàn</h3>
                            <p className="text-gray-600">Bảo mật thông tin</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-lg shadow-md">
                            <div className="text-4xl mb-4">💎</div>
                            <h3 className="text-xl font-semibold mb-2">Chất lượng đảm bảo</h3>
                            <p className="text-gray-600">Sản phẩm chính hãng</p>
                        </div>
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="bg-blue-600 py-12">
                    <div className="container mx-auto px-4">
                        <div className="text-center text-white">
                            <h2 className="text-3xl font-bold mb-4">Đăng ký nhận tin</h2>
                            <p className="mb-6">Nhận thông tin về sản phẩm mới và khuyến mãi</p>
                            <div className="max-w-md mx-auto flex gap-4">
                                <input
                                    type="email"
                                    placeholder="Email của bạn"
                                    className="flex-1 px-4 py-2 rounded-lg focus:outline-none text-gray-800"
                                />
                                <Button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-6 py-2 rounded-lg">
                                    Đăng ký
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
