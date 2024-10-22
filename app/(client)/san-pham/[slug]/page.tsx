"use client"
import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import useFetch from "@/lib/useFetch";
import { motion } from 'framer-motion';
import Loading from "@/components/Loading";


interface Specifications {
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
  specifications: Specifications;
  stock_quantity: number;
  product_created_at: string;
  product_updated_at: string;
  product_status: number;
  thumbnail_id: number;
  thumbnail_url: string;
  thumbnail_alt_text: string;
  categories: string;
  product_image_ids: number[];
  product_image_urls: string[];
}

interface ApiResponse {
  status: number;
  message: string;
  data: Product;
}

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  const { data, loading, error } = useFetch<ApiResponse>(`/api/products/${slug}`);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (loading) return <Loading/>;
  if (error)   return notFound();

  if (!data || !data.data) return notFound();

  const product = data.data;

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 text-black"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          className="product-images"
          initial={{ x: -50 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {product.product_image_urls && product.product_image_urls.length > 0 ? (
            <div>
              <Image
                src={product.product_image_urls[currentImageIndex]}
                alt={product.product_name}
                width={500}
                height={500}
                className="w-full h-auto object-cover rounded-lg shadow-lg mb-4"
              />
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {product.product_image_urls.map((url, index) => (
                  <Image
                    key={index}
                    src={url}
                    alt={`${product.product_name} thumbnail ${index + 1}`}
                    width={100}
                    height={100}
                    className={`w-24 h-24 object-cover rounded-md cursor-pointer ${index === currentImageIndex ? 'border-2 border-blue-500' : ''}`}
                    onClick={() => handleThumbnailClick(index)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
              No image available
            </div>
          )}
        </motion.div>
        <motion.div 
          className="product-details"
          initial={{ x: 50 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4">{product.product_name}</h1>
          <p className="text-2xl font-semibold mb-4 text-blue-600">${parseFloat(product.price).toFixed(2)}</p>
          <p className="mb-6 text-gray-600">{product.description}</p>
          <motion.div 
            className="mb-6 bg-gray-100 p-4 rounded-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold mb-3">Thông số kỹ thuật:</h2>
            <ul className="list-disc list-inside">
              {Object.entries(product.specifications).map(([key, value]) => (
                <li key={key} className="mb-2">
                  <span className="font-medium">{key}:</span> {value}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div 
            className="mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold mb-3">Danh mục:</h2>
            <p className="bg-blue-100 text-blue-800 inline-block px-3 py-1 rounded-full">{product.categories}</p>
          </motion.div>
          <motion.button 
            className="bg-blue-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Thêm vào giỏ hàng
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
