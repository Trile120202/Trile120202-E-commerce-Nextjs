"use client"
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useFetch from "@/lib/useFetch";
import {FaCreditCard, FaShoppingCart} from "react-icons/fa";
import Loading from "@/components/Loading";

interface Specification {
    weight: string;
    dimensions: string;
}

interface Product {
    product_id: number;
    product_name: string;
    brand: string;
    model: string;
    price: string;
    slug: string;
    description: string;
    specifications: Specification;
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

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 flex flex-col h-full">
            <Link href={`/app/(client)/san-pham/${product.slug}`} className="flex-grow">
                <div className="relative w-full h-48">
                    <Image
                        src={product.thumbnail_url}
                        alt={product.thumbnail_alt_text || product.product_name}
                        layout="fill"
                        objectFit="cover"
                    />
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-black truncate">{product.product_name}</h3>
                    <p className="text-gray-600 mb-2">{product.brand} - {product.model}</p>
                    <p className="text-black font-bold">${parseFloat(product.price).toFixed(2)}</p>
                    {product.categories && (
                        <p className="text-sm text-gray-500 mt-2">{product.categories}</p>
                    )}
                </div>
            </Link>
            <div className="flex justify-between p-4 mt-auto">
                <button className="flex items-center justify-center bg-blue-500 text-white px-4  py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 text-sm">
                    <FaShoppingCart className="mr-1" />
                    Add to Cart
                </button>
                <button className="flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300 text-sm">
                    <FaCreditCard className="mr-1" />
                    Buy Now
                </button>
            </div>
        </div>
    );
};

const SectionProductHome: React.FC = () => {
    const { data, loading, error } = useFetch<ApiResponse>('/api/products');

    if (loading) return <Loading/>;
    if (error) return <div className="text-black">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6 text-black">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data?.data.map((product) => (
                    <ProductCard key={product.product_id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default SectionProductHome;
