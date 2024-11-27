'use client'
import Carousel from '../../components/Carousel';
import CategoryHome from '@/components/home/CategoryHome';
import SectionProductHome from "@/components/home/SectionProductHome";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useFetch from "@/lib/useFetch";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import SearchForm from "@/components/home/SearchForm";

export default function Home() {
    const [searchParams, setSearchParams] = useState({
        name: '',
        category: '',
        minPrice: '0',
        maxPrice: '100000000'
    });
    const router = useRouter();


    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <section className="relative h-[600px]">
                <Carousel location="home" position="1" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 flex items-center justify-center z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="container mx-auto px-4"
                    >
                        <div className="text-center text-white mb-8">
                            <h1 className="text-5xl md:text-7xl font-bold mb-4">Z-Shop</h1>
                            <p className="text-xl md:text-2xl font-light">Khám phá công nghệ đỉnh cao</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Filter Section */}
            <section className="py-8 bg-white shadow-lg relative -mt-16 z-20">
                <div className="container mx-auto px-4">
                    <SearchForm/>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-center mb-12">Sản phẩm nổi bật</h2>
                        <SectionProductHome endpoint="/api/products/product-hot" viewAllEndpoint="/san-pham?type=hot" />
                    </motion.div>
                </div>
            </section>

            {/* New Products */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-center mb-12">Sản phẩm mới</h2>
                        <SectionProductHome endpoint="/api/products" viewAllEndpoint="/san-pham" />
                    </motion.div>
                </div>
            </section>

            {/* Gaming Products */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-center mb-12">Gaming</h2>
                        <SectionProductHome endpoint="/api/products?type=gaming" viewAllEndpoint="/san-pham?type=gaming" />
                    </motion.div>
                </div>
            </section>

            {/* Office Products */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-center mb-12">Sinh viên</h2>
                        <SectionProductHome endpoint="/api/products?type=sinh-vien" viewAllEndpoint="/san-pham?type=sinh-vien" />
                    </motion.div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div 
                            className="text-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                            whileHover={{ y: -5 }}
                        >
                            <div className="text-5xl mb-4">⚡️</div>
                            <h3 className="text-xl font-semibold mb-2">Giao hàng nhanh chóng</h3>
                            <p className="text-gray-600">Nhận hàng trong 24h</p>
                        </motion.div>
                        <motion.div 
                            className="text-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                            whileHover={{ y: -5 }}
                        >
                            <div className="text-5xl mb-4">💎</div>
                            <h3 className="text-xl font-semibold mb-2">Chất lượng đảm bảo</h3>
                            <p className="text-gray-600">Sản phẩm chính hãng 100%</p>
                        </motion.div>
                        <motion.div 
                            className="text-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                            whileHover={{ y: -5 }}
                        >
                            <div className="text-5xl mb-4">🛡️</div>
                            <h3 className="text-xl font-semibold mb-2">Bảo hành tận tâm</h3>
                            <p className="text-gray-600">Hỗ trợ 24/7</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-16 bg-blue-600">
                <div className="container mx-auto px-4">
                    <motion.div 
                        className="max-w-2xl mx-auto text-center text-white"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Đăng ký nhận tin</h2>
                        <p className="mb-8 text-blue-100">Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt</p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Email của bạn"
                                className="flex-1 px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-800"
                            />
                            <Button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-8 py-3 rounded-lg font-medium transition-colors duration-300">
                                Đăng ký ngay
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
