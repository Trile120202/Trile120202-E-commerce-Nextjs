"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Loading from "@/components/Loading";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCartItems([
        { id: 1, name: "Product 1", price: 19.99, quantity: 2, image: "/product1.jpg" },
        { id: 2, name: "Product 2", price: 29.99, quantity: 1, image: "/product2.jpg" },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const updateQuantity = (id: number, newQuantity: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item
    ));
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (isLoading) {
    return (
     <Loading/>
    );
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
              key={item.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between border-b py-4"
            >
              <div className="flex items-center">
                <Image src={item.image} alt={item.name} width={80} height={80} className="rounded-md" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-black">{item.name}</h2>
                  <p className="text-gray-600">${item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 bg-gray-200 rounded text-black">-</button>
                <span className="mx-2 text-black">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 bg-gray-200 rounded text-black">+</button>
                <button onClick={() => removeItem(item.id)} className="ml-4 text-red-500">Remove</button>
              </div>
            </motion.div>
          ))}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-right"
          >
            <p className="text-xl font-semibold text-black">Tổng cộng: ${totalPrice.toFixed(2)}</p>
            <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              Thanh toán
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
