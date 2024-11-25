'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Image from 'next/image';
import { OrderStatus } from '@/lib/orderStatus';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: string;
    product_image: string;
    slug: string;
}

interface OrderData {
    id: number;
    status: number;
    total_amount: string;
    note: string;
    full_name: string;
    customer_email: string;
    phone_number: string;
    province_name: string;
    district_name: string;
    ward_name: string;
    address: string;
    payment_method_name: string;
    payment_method_icon: string;
    order_date: string;
    items: OrderItem[];
}

const Page = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const response = await fetch(`/api/orders/${params.id}`);
                const result = await response.json();
                if (response.ok) {
                    setOrderData(result.data);
                    setSelectedStatus(result.data.status.toString());
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError('Có lỗi xảy ra khi tải thông tin đơn hàng');
            }
        };

        fetchOrderData();
    }, [params.id]);

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        setHasChanges(true);
    };

    const handleSave = () => {
        setPendingStatus(selectedStatus);
        setShowConfirmDialog(true);
    };

    const confirmStatusChange = async () => {
        if (!pendingStatus) return;
        
        setLoading(true);
        try {
            const response = await fetch('/api/orders/change-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: params.id,
                    status: parseInt(pendingStatus)
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }

            setOrderData(prev => prev ? {...prev, status: parseInt(pendingStatus)} : null);
            setHasChanges(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật trạng thái');
        } finally {
            setLoading(false);
            setShowConfirmDialog(false);
            setPendingStatus(null);
        }
    };

    if (!orderData) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="p-6">
                        {error ? error : 'Đang tải...'}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận thay đổi trạng thái</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng này?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmStatusChange}>Xác nhận</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card>
                <CardHeader>
                    <CardTitle>Chi tiết đơn hàng #{params.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <Label className="min-w-[150px]">Trạng thái:</Label>
                            <Select
                                value={selectedStatus}
                                onValueChange={handleStatusChange}
                                disabled={loading || orderData.status === 9}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Đang chờ</SelectItem>
                                    <SelectItem value="2">Đang xử lý</SelectItem>
                                    <SelectItem value="3">Đang giao hàng</SelectItem>
                                    <SelectItem value="5">Đã hủy</SelectItem>
                                    <SelectItem value="6">Đang trả hàng</SelectItem>
                                    <SelectItem value="9">Thành công</SelectItem>
                                </SelectContent>
                            </Select>
                            {hasChanges && (
                                <Button 
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    Lưu thay đổi
                                </Button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Thông tin khách hàng</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Họ tên</Label>
                                    <Input value={orderData.full_name} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={orderData.customer_email} disabled />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Thông tin giao hàng</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Số điện thoại</Label>
                                    <Input value={orderData.phone_number} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Địa chỉ</Label>
                                    <Input 
                                        value={`${orderData.address}, ${orderData.ward_name}, ${orderData.district_name}, ${orderData.province_name}`} 
                                        disabled 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Phương thức thanh toán</h3>
                            <div className="flex items-center space-x-2">
                                <Image 
                                    src={orderData.payment_method_icon} 
                                    alt={orderData.payment_method_name}
                                    width={24}
                                    height={24}
                                />
                                <span>{orderData.payment_method_name}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Sản phẩm</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orderData.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 flex items-center space-x-2">
                                                    <Image 
                                                        src={item.product_image} 
                                                        alt={item.product_name}
                                                        width={50}
                                                        height={50}
                                                        className="rounded"
                                                    />
                                                    <span>{item.product_name}</span>
                                                </td>
                                                <td className="px-6 py-4">{item.quantity}</td>
                                                <td className="px-6 py-4">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.price))}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.price) * item.quantity)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-right font-medium">Tổng tiền:</td>
                                            <td className="px-6 py-4 font-medium">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(orderData.total_amount))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Ghi chú</h3>
                            <Textarea
                                value={orderData.note}
                                disabled
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Quay lại
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Page;
