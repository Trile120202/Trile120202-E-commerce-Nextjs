"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaMapMarkerAlt, FaTag, FaCreditCard, FaTrash } from 'react-icons/fa';
import { useCart } from '@/hooks/useCart';

const Page = () => {
    const [address, setAddress] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const { items, total, updateQuantity, removeItem } = useCart();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

            {/* Danh sách sản phẩm */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Sản phẩm</h2>
                {items.map((item) => (
                    <div key={item.cart_item_id} className="flex items-center justify-between border-b py-4">
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
                                <h3 className="font-semibold">{item.product_name}</h3>
                                <p className="text-gray-600">
                                    {item.price ? parseFloat(item.price).toLocaleString('vi-VN') : 0} ₫
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button 
                                onClick={() => item.cart_item_id && item.product_id && item.quantity && 
                                    updateQuantity(item.cart_id, item.cart_item_id, item.product_id, item.quantity - 1)} 
                                className="px-2 py-1 bg-gray-200 rounded"
                            >
                                -
                            </button>
                            <span className="mx-2">{item.quantity || 0}</span>
                            <button 
                                onClick={() => item.cart_item_id && item.product_id && item.quantity && 
                                    updateQuantity(item.cart_id, item.cart_item_id, item.product_id, item.quantity + 1)} 
                                className="px-2 py-1 bg-gray-200 rounded"
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
                    </div>
                ))}
            </div>

            {/* Địa chỉ nhận hàng */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex items-center mb-4">
                    <FaMapMarkerAlt className="text-blue-500 mr-2" />
                    <h2 className="text-xl font-semibold">Địa chỉ nhận hàng</h2>
                </div>
                <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-3 border rounded-md"
                    placeholder="Nhập địa chỉ nhận hàng..."
                    rows={3}
                />
            </div>

            {/* Mã giảm giá */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex items-center mb-4">
                    <FaTag className="text-green-500 mr-2" />
                    <h2 className="text-xl font-semibold">Mã giảm giá</h2>
                </div>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 p-3 border rounded-md"
                        placeholder="Nhập mã giảm giá..."
                    />
                    <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600">
                        Áp dụng
                    </button>
                </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex items-center mb-4">
                    <FaCreditCard className="text-purple-500 mr-2" />
                    <h2 className="text-xl font-semibold">Phương thức thanh toán</h2>
                </div>
                <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                        <input
                            type="radio"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="form-radio"
                        />
                        <span>Thanh toán khi nhận hàng (COD)</span>
                    </label>
                    <label className="flex items-center space-x-3">
                        <input
                            type="radio"
                            value="banking"
                            checked={paymentMethod === 'banking'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="form-radio"
                        />
                        <span>Chuyển khoản ngân hàng</span>
                    </label>
                </div>
            </div>

            {/* Tổng tiền và nút thanh toán */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between mb-4">
                    <span className="font-semibold">Tổng tiền hàng:</span>
                    <span>{total.toLocaleString()} ₫</span>
                </div>
                <div className="flex justify-between mb-4">
                    <span className="font-semibold">Phí vận chuyển:</span>
                    <span>30,000 ₫</span>
                </div>
                <div className="flex justify-between mb-6">
                    <span className="font-semibold">Tổng thanh toán:</span>
                    <span className="text-xl text-red-500 font-bold">{(total + 30000).toLocaleString()} ₫</span>
                </div>
                <button className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 font-semibold">
                    Đặt hàng
                </button>
            </div>
        </div>
    );
};

export default Page;