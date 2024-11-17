"use client"
import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import useFetch from "@/lib/useFetch";
import { motion } from 'framer-motion';
import Loading from "@/components/Loading";
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name: string;
  price: string;
  slug: string;
  description: string;
  specifications: {
    [key: string]: string;
  };
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  status: number;
  thumbnail_id: number;
  thumbnail_url: string;
  category_names: string;
  product_image_ids: number[];
  product_image_urls: string[];
  ram_names: string;
  storage_names: string;
  tags: string;
  display_names: string;
  cpu_names: string;
  graphics_card_names: string;
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
  const { data, loading, error } = useFetch<ApiResponse>(`/api/products/get-product-with-slug?slug=${slug}`);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();
  const { toast } = useToast();

  if (loading) return <Loading/>;
  if (error) return notFound();

  if (!data || !data.data) return notFound();

  const product = data.data;

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleAddToCart = async () => {
    try {
      const response = await fetch('/api/carts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1
        }),
      });

      const result = await response.json();


      if (response.ok) {
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
                alt={product.name}
                width={500}
                height={500}
                className="w-full h-auto object-cover rounded-lg shadow-lg mb-4"
              />
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {product.product_image_urls.map((url, index) => (
                  <Image
                    key={index}
                    src={url}
                    alt={`${product.name} thumbnail ${index + 1}`}
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
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold mb-4 text-blue-600">{parseFloat(product.price).toLocaleString('vi-VN')} ₫</p>
          <motion.div 
            className="mb-6 bg-gray-100 p-4 rounded-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold mb-3">Cấu hình chi tiết:</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-3">
                {product.ram_names && (
                  <li className="flex items-start">
                    <span className="font-medium min-w-[120px] text-gray-700">Bộ nhớ RAM:</span>
                    <span className="ml-2 text-gray-600">{product.ram_names}</span>
                  </li>
                )}
                {product.storage_names && (
                  <li className="flex items-start">
                    <span className="font-medium min-w-[120px] text-gray-700">Ổ cứng:</span>
                    <span className="ml-2 text-gray-600">{product.storage_names}</span>
                  </li>
                )}
                {product.cpu_names && (
                  <li className="flex items-start">
                    <span className="font-medium min-w-[120px] text-gray-700">Vi xử lý:</span>
                    <span className="ml-2 text-gray-600">{product.cpu_names}</span>
                  </li>
                )}
                {product.graphics_card_names && (
                  <li className="flex items-start">
                    <span className="font-medium min-w-[120px] text-gray-700">Card đồ họa:</span>
                    <span className="ml-2 text-gray-600">{product.graphics_card_names}</span>
                  </li>
                )}
                {product.display_names && (
                  <li className="flex items-start">
                    <span className="font-medium min-w-[120px] text-gray-700">Màn hình:</span>
                    <span className="ml-2 text-gray-600">{product.display_names}</span>
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
          <div 
            className="mb-6 text-gray-600"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
          <motion.div 
            className="mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold mb-3">Danh mục:</h2>
            <p className="bg-blue-100 text-blue-800 inline-block px-3 py-1 rounded-full">{product.category_names}</p>
          </motion.div>
          <motion.button 
            className="bg-blue-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
          >
            Thêm vào giỏ hàng
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
