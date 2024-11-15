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
}

interface DashboardData {
    revenue: {
        total: number;
    };
    topSellingProducts: TopProduct[];
}

export default function CMSPage() {
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        revenue: { total: 0 },
        topSellingProducts: []
    });
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

        fetchDashboardData();
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

    const chartData = [
        { name: "Jan", total: 1200 },
        { name: "Feb", total: 2100 },
        { name: "Mar", total: 1800 },
        { name: "Apr", total: 2400 },
        { name: "May", total: 1900 },
        { name: "Jun", total: 2800 },
        { name: "Jul", total: 2600 },
        { name: "Aug", total: 2300 },
        { name: "Sep", total: 2900 },
        { name: "Oct", total: 3100 },
        { name: "Nov", total: 2700 },
        { name: "Dec", total: 3200 },
    ];

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
                        <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+2350</div>
                        <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12,234</div>
                        <p className="text-xs text-muted-foreground">+19% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+573</div>
                        <p className="text-xs text-muted-foreground">+201 since last hour</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
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
                                        <TableCell className="text-right">{product.count}</TableCell>
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
