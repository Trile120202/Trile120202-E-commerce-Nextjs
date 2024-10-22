'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useFetch from "@/lib/useFetch";
import {FaCreditCard, FaShoppingCart} from "react-icons/fa";
import ReactPaginate from 'react-paginate';
import Loading from "@/components/Loading";
import {notFound, useSearchParams} from "next/navigation";

interface Specification {
    weight: string;
    dimensions: string;
}

interface Product {
    slug: string;
    product_id: number;
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

const ProductCard: React.FC<{ product: Product }> = ({product}) => {
    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 flex flex-col h-full">
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
                    <p className="text-black font-bold">{parseFloat(product.price).toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    })}</p>
                    {product.categories && (
                        <p className="text-sm text-gray-500 mt-2">{product.categories}</p>
                    )}
                </div>
            </Link>
            <div className="flex justify-between p-4 mt-auto">
                <button
                    className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 text-sm">
                    <FaShoppingCart className="mr-1"/>
                    Thêm vào giỏ
                </button>
                <button
                    className="flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300 text-sm">
                    <FaCreditCard className="mr-1"/>
                    Mua ngay
                </button>
            </div>
        </div>
    );
};

const ProductsPage: React.FC = () => {
    const searchParams = useSearchParams();
    // @ts-ignore
    const search = searchParams.get('search') ?? '';


    const [currentPage, setCurrentPage] = React.useState(1);
    const {data, loading, error} = useFetch<ApiResponse>(`/api/products?page=${currentPage}&limit=12&search=${search}`);

    if (loading) return <Loading/>;
    if (error) return notFound();

    const handlePageChange = (selectedItem: { selected: number }) => {
        setCurrentPage(selectedItem.selected + 1);
    };

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold my-8 text-black">Sản phẩm {search}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data?.data.map((product) => (
                    <ProductCard key={product.product_id} product={product}/>
                ))}
            </div>
            <ReactPaginate
                pageCount={data?.pagination.totalPages || 0}
                pageRangeDisplayed={3}
                marginPagesDisplayed={2}
                onPageChange={handlePageChange}
                containerClassName="flex justify-center mt-8 mb-4"
                pageClassName="mx-1"
                pageLinkClassName="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                activeClassName="bg-blue-500 text-white"
                previousLabel="Trước"
                nextLabel="Sau"
                previousClassName="mx-1"
                nextClassName="mx-1"
                previousLinkClassName="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                nextLinkClassName="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                disabledClassName="opacity-50 cursor-not-allowed"
            />
        </div>
    );
};

export default ProductsPage;
