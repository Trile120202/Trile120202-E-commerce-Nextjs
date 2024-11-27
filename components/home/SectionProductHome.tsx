"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useFetch from "@/lib/useFetch";
import {FaCreditCard, FaShoppingCart, FaChevronLeft, FaChevronRight} from "react-icons/fa";
import Loading from "@/components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Specification {
    weight?: string;
    dimensions?: string;
}

interface Product {
    product_id: number;
    product_name: string;
    price: string;
    slug: string;
    description: string;
    specifications: Specification | null;
    stock_quantity: number;
    product_created_at: string;
    product_updated_at: string;
    product_status: number;
    thumbnail_id: number;
    thumbnail_url: string;
    thumbnail_alt_text: string;
    categories: string | null;
    product_image_ids: number[];
    product_image_urls: string[];
    ram_names: string | null;
    ram_ids: number[];
    storage_names: string | null;
    storage_ids: number[];
    tags: string | null;
    tag_ids: number[];
}

interface ApiResponse {
    status: number;
    message: string;
    data: Product[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const { toast } = useToast();

    const handleAddToCart = async () => {
        try {
            const response = await fetch('/api/carts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: product.product_id,
                    quantity: 1
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setIsAnimating(true);
                setTimeout(() => setIsAnimating(false), 1000);
                toast({
                    description: 'Đã thêm sản phẩm vào giỏ hàng!',
                });
            } else {
                toast({
                    description: result.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng',
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                description: 'Có lỗi xảy ra khi thêm vào giỏ hàng',
                variant: "destructive"
            });
            console.error('Error adding to cart:', error);
        }
    };

    return (
        <motion.div 
            className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col h-full my-3 relative group "
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex-grow">
                <div className="relative w-full h-64 overflow-hidden">
                    <Image
                        src={product.thumbnail_url}
                        alt={product.thumbnail_alt_text || product.product_name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.stock_quantity <= 0 && (
                        <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                            Hết hàng
                        </div>
                    )}
                    {product.product_status === 0 && (
                        <div className="absolute top-4 left-4 bg-yellow-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                            Ngưng kinh doanh
                        </div>
                    )}
                    {product.categories && (
                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                            {product.categories}
                        </div>
                    )}
                </div>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-gray-800 line-clamp-2 min-h-[3.5rem] hover:text-blue-600 transition-colors">
                        {product.product_name}
                    </h3>
                    <div className="space-y-3">
                        {product.ram_names && (
                            <p className="text-gray-600 flex items-center gap-2">
                                <span className="font-semibold text-gray-700">RAM:</span> 
                                <span className="bg-blue-50 px-3 py-1 rounded-full text-blue-600">{product.ram_names}</span>
                            </p>
                        )}
                        {product.storage_names && (
                            <p className="text-gray-600 flex items-center gap-2">
                                <span className="font-semibold text-gray-700">Bộ nhớ:</span> 
                                <span className="bg-green-50 px-3 py-1 rounded-full text-green-600">{product.storage_names}</span>
                            </p>
                        )}
                        <p className="text-3xl font-bold text-blue-600 mt-4">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                                .format(parseFloat(product.price))}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex justify-between p-6 mt-auto gap-4 border-t border-gray-100">
                <motion.button 
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity <= 0 || product.product_status === 0}
                    className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl transition-all duration-300 text-sm font-semibold ${
                        product.stock_quantity <= 0 || product.product_status === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:shadow-blue-200'
                    }`}
                    whileTap={(product.stock_quantity > 0 && product.product_status !== 0) ? { scale: 0.95 } : {}}
                >
                    <FaShoppingCart className="mr-2 text-lg" />
                    <span>Thêm vào giỏ</span>
                </motion.button>
                <Link href={`/san-pham/${product.slug}`} className="flex-1">
                    <motion.button 
                        className="w-full flex items-center justify-center px-6 py-3 rounded-xl transition-all duration-300 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white hover:shadow-lg hover:shadow-green-200"
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>Chi tiết</span>
                    </motion.button>
                </Link>
            </div>

            <AnimatePresence>
                {isAnimating && (
                    <motion.div
                        initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
                        animate={{ 
                            scale: 0.5,
                            x: window.innerWidth - 100,
                            y: -window.innerHeight + 100,
                            opacity: 0
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 50
                        }}
                    >
                        <Image
                            src={product.thumbnail_url}
                            alt={product.thumbnail_alt_text || product.product_name}
                            width={100}
                            height={100}
                            className="rounded-xl shadow-2xl"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

interface SectionProductHomeProps {
    endpoint?: string;
    viewAllEndpoint?: string;
}

const SectionProductHome: React.FC<SectionProductHomeProps> = ({ 
    endpoint = '/api/products/get-data',
    viewAllEndpoint = '/san-pham'
}) => {
    const { data, loading, error } = useFetch<ApiResponse>(endpoint);
    if (loading) return <Loading/>;
    if (error) return <div className="text-black">Error: {error}</div>;

    return (
        <section className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-bold text-gray-800 relative">
                    Sản phẩm nổi bật
                    <span className="absolute -bottom-2 left-0 w-20 h-1 bg-blue-600"></span>
                </h2>
                <Link href={viewAllEndpoint} className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                    Xem tất cả 
                    <span className="transform transition-transform group-hover:translate-x-1">→</span>
                </Link>
            </div>
            
            <div className="relative">
                <button className="absolute -left-16 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg hover:shadow-xl transition-all swiper-button-prev">
                    <FaChevronLeft className="text-gray-800 text-xl" />
                </button>
                <button className="absolute -right-16 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg hover:shadow-xl transition-all swiper-button-next">
                    <FaChevronRight className="text-gray-800 text-xl" />
                </button>

                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    navigation={{
                        prevEl: '.swiper-button-prev',
                        nextEl: '.swiper-button-next',
                    }}
                   
                    autoplay={{
                        delay: 4500,
                        disableOnInteraction: false,
                    }}
                    breakpoints={{
                        640: {
                            slidesPerView: 2,
                        },
                        768: {
                            slidesPerView: 3,
                        },
                        1024: {
                            slidesPerView: 4,
                        },
                    }}
                    className="py-8"
                >
                    {data?.data.map((product) => (
                        <SwiperSlide key={product.product_id}>
                            <ProductCard product={product} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default SectionProductHome;
