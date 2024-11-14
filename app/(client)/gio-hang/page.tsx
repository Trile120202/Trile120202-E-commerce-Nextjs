"use client"
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Loading from "@/components/Loading";
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/navigation';
import { FaTrash } from 'react-icons/fa';

interface CartItem {
  cart_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  cart_item_id: string | null;
  quantity: number | null;
  product_id: string | null;
  product_name: string | null;
  price: string | null;
  slug: string | null;
  thumbnail_url: string | null;
}

interface CartResponse {
  status: number;
  message: string;
  data: CartItem[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CartPage() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR<CartResponse>('/api/carts', fetcher);

  const cartItems = data?.data?.filter(item => item.product_id !== null) || [];

  const updateQuantity = async (cartId:number, cartItemId: number, productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch(`/api/carts/update-quantity-product-in-cart?id=${cartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          cart_item_id: cartItemId,
          quantity: newQuantity
        }),
      });

      if (response.ok) {
        mutate('/api/carts');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (cartId: number, cartItemId: number, productId: number) => {
    try {
      const response = await fetch(`/api/carts/remove-product-in-cart?id=${cartId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_item_id: cartItemId,
          product_id: productId
        }),
      });

      if (response.ok) {
        mutate('/api/carts');
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    if (item.price && item.quantity) {
      return sum + parseFloat(item.price) * item.quantity;
    }
    return sum;
  }, 0);

  if (isLoading) {
    return <Loading/>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading cart</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 text-black"
    >
      <h1 className="text-3xl font-bold mb-8 text-center text-black">Giỏ hàng của bạn</h1>
      {cartItems.length === 0 ? (
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-xl text-black"
        >
          Giỏ hàng của bạn đang trống.
        </motion.p>
      ) : (
        <div>
          {cartItems.map((item, index) => (
            <motion.div
              key={item.cart_item_id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between border-b py-4"
            >
              <div className="flex items-center">
                {item.thumbnail_url && (
                  <Image 
                    src={item.thumbnail_url} 
                    alt={item.product_name || 'Product'} 
                    width={80} 
                    height={80} 
                    className="rounded-md"
                  />
                )}
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-black">{item.product_name}</h2>
                  <p className="text-gray-600">
                    {item.price ? parseFloat(item.price).toLocaleString('vi-VN') : 0} ₫
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={() => item.cart_item_id && item.product_id && item.quantity && 
                    updateQuantity(item.cart_id, item.cart_item_id, item.product_id, item.quantity - 1)} 
                  className="px-2 py-1 bg-gray-200 rounded text-black"
                >
                  -
                </button>
                <span className="mx-2 text-black">{item.quantity || 0}</span>
                <button 
                  onClick={() => item.cart_item_id && item.product_id && item.quantity && 
                    updateQuantity(item.cart_id, item.cart_item_id, item.product_id, item.quantity + 1)} 
                  className="px-2 py-1 bg-gray-200 rounded text-black"
                >
                  +
                </button>
                <button 
                  onClick={() => item.cart_id && item.cart_item_id && item.product_id && 
                    removeItem(item.cart_id, item.cart_item_id, item.product_id)}
                  className="ml-4 text-red-500 hover:text-red-700"
                >
                  <FaTrash size={18} />
                </button>
              </div>
            </motion.div>
          ))}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-right"
          >
            <p className="text-xl font-semibold text-black">
              Tổng cộng: {totalPrice.toLocaleString('vi-VN')} ₫
            </p>
            <button 
              onClick={() => router.push('/thanh-toan')}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Thanh toán
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
