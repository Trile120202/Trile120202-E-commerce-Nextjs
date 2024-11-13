'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const Page = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        user_id: '',
        payment_method_id: '',
        delivery_address: {
            full_name: '',
            phone_number: '',
            address: '',
            province_code: '',
            district_code: '',
            ward_code: ''
        },
        items: [{
            product_id: '',
            quantity: 1,
            price: 0
        }],
        note: '',
        status: 1
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof typeof prev],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra khi tạo đơn hàng');
            }

            router.push('/quan-tri/quan-ly-don-hang');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Tạo đơn hàng mới</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="user_id">Khách hàng</Label>
                                <Select 
                                    onValueChange={(value) => setFormData(prev => ({...prev, user_id: value}))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn khách hàng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Khách hàng 1</SelectItem>
                                        <SelectItem value="2">Khách hàng 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment_method_id">Phương thức thanh toán</Label>
                                <Select
                                    onValueChange={(value) => setFormData(prev => ({...prev, payment_method_id: value}))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn phương thức thanh toán" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Thanh toán khi nhận hàng</SelectItem>
                                        <SelectItem value="2">Chuyển khoản ngân hàng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Địa chỉ giao hàng</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="delivery_address.full_name">Họ tên người nhận</Label>
                                    <Input
                                        id="delivery_address.full_name"
                                        name="delivery_address.full_name"
                                        value={formData.delivery_address.full_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="delivery_address.phone_number">Số điện thoại</Label>
                                    <Input
                                        id="delivery_address.phone_number"
                                        name="delivery_address.phone_number"
                                        value={formData.delivery_address.phone_number}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Tỉnh/Thành phố</Label>
                                    <Select
                                        onValueChange={(value) => setFormData(prev => ({
                                            ...prev,
                                            delivery_address: {
                                                ...prev.delivery_address,
                                                province_code: value
                                            }
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn tỉnh/thành phố" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="01">Hà Nội</SelectItem>
                                            <SelectItem value="02">TP. Hồ Chí Minh</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Quận/Huyện</Label>
                                    <Select
                                        onValueChange={(value) => setFormData(prev => ({
                                            ...prev,
                                            delivery_address: {
                                                ...prev.delivery_address,
                                                district_code: value
                                            }
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn quận/huyện" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="001">Quận 1</SelectItem>
                                            <SelectItem value="002">Quận 2</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Phường/Xã</Label>
                                    <Select
                                        onValueChange={(value) => setFormData(prev => ({
                                            ...prev,
                                            delivery_address: {
                                                ...prev.delivery_address,
                                                ward_code: value
                                            }
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn phường/xã" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="00001">Phường 1</SelectItem>
                                            <SelectItem value="00002">Phường 2</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="delivery_address.address">Địa chỉ cụ thể</Label>
                                <Input
                                    id="delivery_address.address"
                                    name="delivery_address.address"
                                    value={formData.delivery_address.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Ghi chú</h3>
                            <Textarea
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                placeholder="Nhập ghi chú cho đơn hàng (nếu có)"
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Tạo đơn hàng'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Page;
