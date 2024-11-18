'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useFetch from "@/lib/useFetch";
import {FaCreditCard, FaShoppingCart} from "react-icons/fa";
import ReactPaginate from 'react-paginate';
import Loading from "@/components/Loading";
import {notFound, useSearchParams} from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import SearchForm from "@/components/home/SearchForm";

interface Specification {
    weight: string;
    dimensions: string;
}

interface Product {
    slug: string;
    product_id: string;
    product_name: string;
    brand: string;
    model: string;
    price: string;
    description: string;
    specifications: Specification;
    stock_quantity: number;
    product_created_at: string;
    product_updated_at: string;
    product_status: number;
    thumbnail_id: string;
    thumbnail_url: string;
    thumbnail_alt_text: string;
    categories: string | null;
    product_image_ids: string[];
    product_image_urls: string[];
    ram_names: string | null;
    storage_names: string | null;
}

interface ApiResponse {
    status: number;
    message: string;
    data: Product[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: string;
        totalPages: number;
    };
}

const ProductCard: React.FC<{ product: Product }> = ({product}) => {
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
            className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full relative"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Link href={`/san-pham/${product.slug}`} className="flex-grow">
                <div className="relative w-full h-56 sm:h-48 md:h-52 lg:h-60">
                    <Image
                        src={product.thumbnail_url}
                        alt={product.thumbnail_alt_text || product.product_name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 hover:scale-105"
                    />
                    {product.stock_quantity <= 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                            Hết hàng
                        </div>
                    )}
                </div>
                <div className="p-5">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 line-clamp-2 min-h-[3.5rem]">
                        {product.product_name}
                    </h3>
                    <div className="space-y-2">
                        {product.ram_names && (
                            <p className="text-gray-600">
                                <span className="font-medium">RAM:</span> {product.ram_names}
                            </p>
                        )}
                        {product.storage_names && (
                            <p className="text-gray-600">
                                <span className="font-medium">Bộ nhớ:</span> {product.storage_names}
                            </p>
                        )}
                        <p className="text-2xl font-bold text-blue-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                                .format(parseFloat(product.price))}
                        </p>
                        {product.categories && (
                            <p className="text-sm text-gray-500 bg-gray-100 inline-block px-3 py-1 rounded-full">
                                {product.categories}
                            </p>
                        )}
                    </div>
                </div>
            </Link>
            <div className="flex justify-between p-5 mt-auto gap-3">
                <motion.button 
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity <= 0}
                    className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-colors duration-300 text-sm font-medium ${
                        product.stock_quantity <= 0 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    whileTap={product.stock_quantity > 0 ? { scale: 0.95 } : {}}
                >
                    <FaShoppingCart className="sm:mr-2" />
                    <span className="hidden sm:inline">Thêm vào giỏ</span>
                </motion.button>
                <Link href={`/san-pham/${product.slug}`}>
                    <motion.button 
                        className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-colors duration-300 text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaCreditCard className="sm:mr-2" />
                        <span className="hidden sm:inline">Xem</span>
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
                            className="rounded-lg shadow-lg"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const ProductsPage: React.FC = () => {
    const searchParams = useSearchParams();
    const search = searchParams?.get('search') ?? '';
    const minPrice = searchParams?.get('minPrice') ?? '';
    const maxPrice = searchParams?.get('maxPrice') ?? '';
    const categoryId = searchParams?.get('categoryId') ?? '';
    const type = searchParams?.get('type') ?? '';
    const [currentPage, setCurrentPage] = React.useState(1);
    const {data, loading, error} = useFetch<ApiResponse>(`/api/products?page=${currentPage}&limit=12&search=${search}&categoryId=${categoryId}&minPrice=${minPrice}&maxPrice=${maxPrice}&type=${type}`);

    if (loading) return <Loading/>;
    if (error) return notFound();

    const handlePageChange = (selectedItem: { selected: number }) => {
        setCurrentPage(selectedItem.selected + 1);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">
                {search ? `Kết quả tìm kiếm cho "${search}"` : type === 'hot' ? 'Sản phẩm nổi bật' : 'Tất cả sản phẩm'}
            </h1>
            <div className="mb-8">
                <SearchForm />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
                {data?.data.map((product) => (
                    <ProductCard key={product.product_id} product={product}/>
                ))}
            </div>
            <ReactPaginate
                pageCount={data?.pagination.totalPages || 0}
                pageRangeDisplayed={3}
                marginPagesDisplayed={2}
                onPageChange={handlePageChange}
                containerClassName="flex justify-center items-center gap-2 mt-8 mb-4"
                pageClassName="mx-1"
                pageLinkClassName="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors duration-300"
                activeClassName="!bg-blue-600 text-white border-blue-600 hover:!bg-blue-700"
                previousLabel="← Trước"
                nextLabel="Sau →"
                previousClassName="mx-1"
                nextClassName="mx-1"
                previousLinkClassName="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors duration-300"
                nextLinkClassName="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors duration-300"
                disabledClassName="opacity-50 cursor-not-allowed"
                breakLabel="..."
                breakClassName="mx-1"
                breakLinkClassName="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-200"
            />
        </div>
    );
};

export default ProductsPage;
