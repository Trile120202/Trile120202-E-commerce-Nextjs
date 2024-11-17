"use client"
import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import useFetch from "@/lib/useFetch";
import { motion } from 'framer-motion';
import Loading from "@/components/Loading";
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { FaShoppingCart } from 'react-icons/fa';

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
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div 
              className="product-images"
              initial={{ x: -50 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {product.product_image_urls && product.product_image_urls.length > 0 ? (
                <div>
                  <div className="relative group">
                    <Image
                      src={product.product_image_urls[currentImageIndex]}
                      alt={product.name}
                      width={500}
                      height={500}
                      className="w-full h-[500px] object-cover rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"/>
                  </div>
                  <div className="flex overflow-x-auto space-x-4 mt-6 pb-2 scrollbar-hide">
                    {product.product_image_urls.map((url, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Image
                          src={url}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          width={100}
                          height={100}
                          className={`w-24 h-24 object-cover rounded-lg cursor-pointer transition-all duration-200
                            ${index === currentImageIndex ? 'border-2 border-blue-500 shadow-lg' : 'border-2 border-transparent hover:border-blue-300'}`}
                          onClick={() => handleThumbnailClick(index)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center rounded-xl">
                  <p className="text-gray-500 text-lg">Không có hình ảnh</p>
                </div>
              )}
            </motion.div>

            <motion.div 
              className="product-details space-y-8"
              initial={{ x: 50 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
                <p className="text-3xl font-bold text-blue-600">{parseFloat(product.price).toLocaleString('vi-VN')} ₫</p>
              </div>

              <motion.div 
                className="bg-gray-50 rounded-xl p-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Cấu hình chi tiết</h2>
                <div className="space-y-4">
                  {product.ram_names && (
                    <div className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                      <span className="font-semibold text-gray-700 w-32">Bộ nhớ RAM</span>
                      <span className="text-gray-600">{product.ram_names}</span>
                    </div>
                  )}
                  {product.storage_names && (
                    <div className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                      <span className="font-semibold text-gray-700 w-32">Ổ cứng</span>
                      <span className="text-gray-600">{product.storage_names}</span>
                    </div>
                  )}
                  {product.cpu_names && (
                    <div className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                      <span className="font-semibold text-gray-700 w-32">Vi xử lý</span>
                      <span className="text-gray-600">{product.cpu_names}</span>
                    </div>
                  )}
                  {product.graphics_card_names && (
                    <div className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                      <span className="font-semibold text-gray-700 w-32">Card đồ họa</span>
                      <span className="text-gray-600">{product.graphics_card_names}</span>
                    </div>
                  )}
                  {product.display_names && (
                    <div className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                      <span className="font-semibold text-gray-700 w-32">Màn hình</span>
                      <span className="text-gray-600">{product.display_names}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              <div 
                className="prose prose-blue max-w-none bg-white rounded-xl p-6 shadow-sm"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />

              <motion.div 
                className="space-y-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold text-gray-800">Danh mục</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-medium">
                    {product.category_names}
                  </span>
                </div>
              </motion.div>

              {product.tags && (
                <motion.div
                  className="space-y-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-xl font-semibold text-gray-800">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.split(',').map((tag, index) => (
                      <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.button 
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold
                  hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
              >
                <FaShoppingCart className="text-xl" />
                Thêm vào giỏ hàng
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
