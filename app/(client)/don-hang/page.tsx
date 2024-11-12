"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Loading from "@/components/Loading";
import useSWR from 'swr';
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface Order {
    order_id: number;
    user_id: number;
    total_amount: number;
    status: string;
    created_at: string;
    shipping_address: string;
    payment_method: string;
    items: OrderItem[];
}

interface OrderItem {
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    thumbnail_url: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const Page = () => {
    const { data, error, isLoading } = useSWR('/api/orders', fetcher);

    if (isLoading) return <Loading />;
    if (error) return <div>Đã có lỗi xảy ra</div>;

    const orders = data?.data || [];

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'pending': return 'text-yellow-500';
            case 'processing': return 'text-blue-500';
            case 'shipped': return 'text-purple-500';
            case 'delivered': return 'text-green-500';
            case 'cancelled': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'pending': return <FaBox />;
            case 'processing': return <FaTruck className="animate-pulse" />;
            case 'shipped': return <FaTruck />;
            case 'delivered': return <FaCheckCircle />;
            case 'cancelled': return <FaTimesCircle />;
            default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>
            
            <div className="space-y-6">
                {orders.map((order: Order) => (
                    <motion.div 
                        key={order.order_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-lg shadow-md"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <span className="font-semibold">Đơn hàng #{order.order_id}</span>
                                <p className="text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                            <div className={`flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span>{order.status}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.product_id} className="flex items-center gap-4">
                                    <div className="relative w-20 h-20">
                                        <Image
                                            src={item.thumbnail_url}
                                            alt={item.product_name}
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{item.product_name}</h3>
                                        <p className="text-sm text-gray-500">
                                            Số lượng: {item.quantity} x {item.price.toLocaleString('vi-VN')}₫
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Địa chỉ: {order.shipping_address}</p>
                                    <p className="text-sm text-gray-500">Phương thức: {order.payment_method}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Tổng tiền:</p>
                                    <p className="font-bold text-lg">
                                        {order.total_amount.toLocaleString('vi-VN')}₫
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Page;