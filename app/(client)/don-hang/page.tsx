"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Loading from "@/components/Loading";
import useSWR from 'swr';
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    thumbnail_url: string;
    description: string;
    category_id: number;
}

interface Order {
    id: number;
    user_id: number;
    total_amount: number;
    status: number;
    shipping_address: string;
    payment_method_id: number;
    delivery_address_id: number;
    note: string;
    order_date: string;
    created_at: string;
    updated_at: string;
    payment_method_name: string;
    payment_method_icon: string;
    delivery_address: string;
    delivery_phone: string;
    items: OrderItem[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const Page = () => {
    const { data, error, isLoading, mutate } = useSWR('/api/orders', fetcher);
    const { toast } = useToast();
    const [cancellingOrders, setCancellingOrders] = useState<number[]>([]);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    if (isLoading) return <Loading />;
    if (error) return <div>Đã có lỗi xảy ra</div>;

    const orders = data?.data || [];

    const handleCancelOrder = async (orderId: number) => {
        try {
            setCancellingOrders(prev => [...prev, orderId]);
            
            const response = await fetch('/api/orders/cancel-order', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId }),
            });

            const result = await response.json();

            if (response.ok) {
                toast({
                    title: "Thành công",
                    description: "Đã hủy đơn hàng thành công",
                });
                mutate(); // Refresh the orders data
            } else {
                toast({
                    variant: "destructive",
                    title: "Lỗi",
                    description: result.message || "Không thể hủy đơn hàng",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi hủy đơn hàng",
            });
        } finally {
            setCancellingOrders(prev => prev.filter(id => id !== orderId));
            setShowConfirmDialog(false);
            setSelectedOrderId(null);
        }
    };

    const getStatusText = (status: number) => {
        switch(status) {
            case 1: return 'Chờ xác nhận';
            case 2: return 'Đang xử lý';
            case 3: return 'Đang giao hàng';
            case 4: return 'Đã giao hàng';
            case 5: return 'Đã hủy';
            case 6: return 'Đang hoàn trả';
            case 7: return 'Hoàn trả thành công';
            case 8: return 'Hoàn trả thất bại';
            default: return 'Không xác định';
        }
    };

    const getStatusColor = (status: number) => {
        switch(status) {
            case 1: return 'text-yellow-500';
            case 2: return 'text-blue-500';
            case 3: return 'text-purple-500';
            case 4: return 'text-green-500';
            case 5: return 'text-red-500';
            case 6: return 'text-orange-500';
            case 7: return 'text-emerald-500';
            case 8: return 'text-rose-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusIcon = (status: number) => {
        switch(status) {
            case 1: return <FaBox />;
            case 2: return <FaTruck className="animate-pulse" />;
            case 3: return <FaTruck />;
            case 4: return <FaCheckCircle />;
            case 5: return <FaTimesCircle />;
            case 6: return <FaBox className="animate-pulse" />;
            case 7: return <FaCheckCircle />;
            case 8: return <FaTimesCircle />;
            default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>
            
            <div className="space-y-6">
                {orders.map((order: Order) => (
                    <motion.div 
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-lg shadow-md"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <span className="font-semibold">Đơn hàng #{order.id}</span>
                                <p className="text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    <span>{getStatusText(order.status)}</span>
                                </div>
                                {[1, 2].includes(order.status) && (
                                    <button
                                        onClick={() => {
                                            setSelectedOrderId(order.id);
                                            setShowConfirmDialog(true);
                                        }}
                                        disabled={cancellingOrders.includes(order.id)}
                                        className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {cancellingOrders.includes(order.id) ? 'Đang hủy...' : 'Hủy đơn'}
                                    </button>
                                )}
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
                                    <p className="text-sm text-gray-500">Địa chỉ: {order.delivery_address}</p>
                                    <p className="text-sm text-gray-500">Số điện thoại: {order.delivery_phone}</p>
                                    <p className="text-sm text-gray-500">
                                        Phương thức thanh toán: {order.payment_method_name}
                                    </p>
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

            {showConfirmDialog && selectedOrderId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Xác nhận hủy đơn</h2>
                        <p className="mb-6">Bạn có chắc chắn muốn hủy đơn hàng #{selectedOrderId}?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setShowConfirmDialog(false);
                                    setSelectedOrderId(null);
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Không
                            </button>
                            <button
                                onClick={() => handleCancelOrder(selectedOrderId)}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Xác nhận hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;