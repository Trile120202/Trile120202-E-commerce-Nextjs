'use client';

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import Image from "next/image";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface TopProduct {
    product_id: string;
    count: string;
    name: string;
    thumbnail: string;
    category_name: string;
    category_slug: string;
    total_quantity: string;
    total_orders: string;
    stock_quantity: number;
}

interface Orders {
    pendingOrders: number;
    processingOrders: number;
    confirmedOrders: number;
    shippingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    refundRequestedOrders: number;
    refundingOrders: number;
    refundedOrders: number;
    completedOrders: number;
    totalOrders: number;
}

interface DashboardData {
    revenue: {
        total: number;
    };
    orders: Orders;
    topSellingProducts: TopProduct[];
    deliverySuccessRate: number;
}

export default function CMSPage() {
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        revenue: { total: 0 },
        orders: {
            pendingOrders: 0,
            processingOrders: 0,
            confirmedOrders: 0,
            shippingOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
            refundRequestedOrders: 0,
            refundingOrders: 0,
            refundedOrders: 0,
            completedOrders: 0,
            totalOrders: 0
        },
        topSellingProducts: [],
        deliverySuccessRate: 0
    });
    const [chartData, setChartData] = useState<{ name: string; total: number; }[]>([]);
    const [period, setPeriod] = useState('year');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState<number | undefined>();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const queryParams = new URLSearchParams({
                    period,
                    year: year.toString()
                });
                if (month) {
                    queryParams.append('month', month.toString());
                }
                
                const response = await fetch(`/api/dashboard/revenue?${queryParams}`);
                const result = await response.json();
                if (result.status === 200) {
                    setDashboardData(result.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        const fetchChartData = async () => {
            try {
                const response = await fetch(`/api/dashboard/chart?year=${year}`);
                const result = await response.json();
                if (result.status === 200) {
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const formattedData = result.data.map((total: number, index: number) => ({
                        name: monthNames[index],
                        total
                    }));
                    setChartData(formattedData);
                }
            } catch (error) {
                console.error('Error fetching chart data:', error);
            }
        };

        fetchDashboardData();
        fetchChartData();
    }, [period, year, month]);

    const periodOptions = [
        { value: 'year', label: 'Năm' },
        { value: 'quarter1', label: 'Quý 1' },
        { value: 'quarter2', label: 'Quý 2' },
        { value: 'quarter3', label: 'Quý 3' },
        { value: 'quarter4', label: 'Quý 4' },
        { value: 'month', label: 'Tháng' }
    ];

    const yearOptions = Array.from({ length: 5 }, (_, i) => {
        const yearValue = new Date().getFullYear() - i;
        return { value: yearValue, label: `Năm ${yearValue}` };
    });

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: `Tháng ${i + 1}`
    }));

    return (
        <div className="cms-content p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Bảng điều khiển quản trị
                </h1>
                
                <div className="flex gap-4">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Chọn kỳ" />
                        </SelectTrigger>
                        <SelectContent>
                            {periodOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={year.toString()} onValueChange={(val) => setYear(parseInt(val))}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Chọn năm" />
                        </SelectTrigger>
                        <SelectContent>
                            {yearOptions.map(option => (
                                <SelectItem key={option.value} value={option.value.toString()}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {period === 'month' && (
                        <Select 
                            value={month?.toString()} 
                            onValueChange={(val) => setMonth(parseInt(val))}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Chọn tháng" />
                            </SelectTrigger>
                            <SelectContent>
                                {monthOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value.toString()}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dashboardData.revenue.total)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {period === 'year' ? `Năm ${year}` : 
                             period.startsWith('quarter') ? `Quý ${period.slice(-1)} năm ${year}` :
                             `Tháng ${month} năm ${year}`}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chi tiết đơn hàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.orders.totalOrders}</div>
                        <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                                <span>Chờ xác nhận:</span>
                                <span>{dashboardData.orders.pendingOrders}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Đang xử lý:</span>
                                <span>{dashboardData.orders.processingOrders}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Đang giao:</span>
                                <span>{dashboardData.orders.shippingOrders}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Đã hủy:</span>
                                <span>{dashboardData.orders.cancelledOrders}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Hoàn thành:</span>
                                <span>{dashboardData.orders.completedOrders}</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {period === 'year' ? `Năm ${year}` : 
                             period.startsWith('quarter') ? `Quý ${period.slice(-1)} năm ${year}` :
                             `Tháng ${month} năm ${year}`}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Trung bình đơn hàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dashboardData.orders.totalOrders > 0 
                                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                                    .format(dashboardData.revenue.total / dashboardData.orders.totalOrders)
                                : '0 ₫'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {period === 'year' ? `Năm ${year}` : 
                             period.startsWith('quarter') ? `Quý ${period.slice(-1)} năm ${year}` :
                             `Tháng ${month} năm ${year}`}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.deliverySuccessRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {period === 'year' ? `Năm ${year}` : 
                             period.startsWith('quarter') ? `Quý ${period.slice(-1)} năm ${year}` :
                             `Tháng ${month} năm ${year}`}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Biểu đồ doanh thu</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis 
                                    stroke="#888888" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { 
                                        style: 'currency', 
                                        currency: 'VND',
                                        notation: 'compact'
                                    }).format(value)} 
                                />
                                <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Sản phẩm bán chạy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sản phẩm</TableHead>
                                    <TableHead>Danh mục</TableHead>
                                    <TableHead className="text-right">Số lượng</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dashboardData.topSellingProducts.map((product, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Image 
                                                src={product.thumbnail} 
                                                alt={product.name}
                                                width={40}
                                                height={40}
                                                className="rounded-sm"
                                            />
                                            <span className="line-clamp-2">{product.name}</span>
                                        </TableCell>
                                        <TableCell>{product.category_name}</TableCell>
                                        <TableCell className="text-right">{product.total_quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
