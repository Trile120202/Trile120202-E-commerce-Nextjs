'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import { BsThreeDots } from 'react-icons/bs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import useApi from '@/lib/useApi';
import DataTable from "@/components/custom/datatable";
import { useToast } from "@/hooks/use-toast";
import { ChangeStatus } from "@/components/custom/ChangeStatus";
import Image from 'next/image';

interface Product {
    product_id: number;
    product_name: string;
    categories: string;
    price: string;
    stock_quantity: number;
    product_status: number;
    thumbnail_url: string;
    thumbnail_alt_text: string;
    ram_names: string;
    storage_names: string;
}

interface ApiResponse {
    status: number;
    message: string;
    data: Product[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: string;
        totalPages: number;
    };
}

const Page = () => {
    const router = useRouter();
    const { toast } = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [limit, setLimit] = useState(10);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { data, loading, error, fetchData } = useApi<ApiResponse>(
        `/api/products?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchKeyword)}${selectedStatus !== 'all' ? `&status=${selectedStatus}` : ''}`,
        { method: 'GET' }
    );

    useEffect(() => {
        try {
            fetchData();
        } catch (err) {
            console.error('Error fetching products:', err);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Có lỗi xảy ra khi tải dữ liệu sản phẩm"
            });
        }
    }, [currentPage, selectedStatus, searchKeyword, limit]);

    const handleEdit = (id: number) => {
        router.push(`/quan-tri/quan-ly-san-pham/${id}`);
    };

    const formatPrice = (price: string) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(parseFloat(price));
    };

    const getStatusColor = (status: number) => {
        return status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const columns = [
        {
            accessor: 'thumbnail',
            label: 'Hình ảnh',
            className: 'w-24',
            render: (row: Product) => (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <Image
                        src={row.thumbnail_url}
                        alt={row.thumbnail_alt_text}
                        fill
                        className="object-cover"
                    />
                </div>
            )
        },
        {
            accessor: 'product_info',
            label: 'Thông tin sản phẩm',
            className: 'min-w-[300px]',
            render: (row: Product) => (
                <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">{row.product_name}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                        {row.categories.split(',').map((category, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 rounded-full">
                                {category.trim()}
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                        {row.ram_names && (
                            <span className="flex items-center gap-1">
                                <span className="font-medium">RAM:</span> {row.ram_names}
                            </span>
                        )}
                        {row.storage_names && (
                            <span className="flex items-center gap-1">
                                <span className="font-medium">Bộ nhớ:</span> {row.storage_names}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            accessor: 'price',
            label: 'Giá',
            className: 'text-right',
            render: (row: Product) => (
                <span className="font-medium text-gray-900">
                    {formatPrice(row.price)}
                </span>
            )
        },
        {
            accessor: 'stock_quantity',
            label: 'Tồn kho',
            className: 'text-center',
            render: (row: Product) => (
                <span className="font-medium">
                    {row.stock_quantity.toLocaleString()}
                </span>
            )
        },
        {
            accessor: 'product_status',
            label: 'Trạng thái',
            className: 'text-center',
            render: (row: Product) => (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.product_status)}`}>
                    {row.product_status === 1 ? 'Còn hàng' : 'Hết hàng'}
                </span>
            )
        },
        {
            accessor: 'actions',
            label: 'Thao tác',
            className: 'text-right',
            render: (row: Product) => (
                <>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(row.product_id)}
                            className="hidden md:flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
                        >
                            <FaEdit className="h-4 w-4" />
                            Sửa
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setSelectedId(row.product_id)}
                            className="hidden md:flex items-center gap-2 hover:bg-red-600"
                        >
                            <FaTrash className="h-4 w-4" />
                            Xóa
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="md:hidden">
                                    <BsThreeDots className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(row.product_id)}>
                                    <FaEdit className="mr-2 h-4 w-4" />
                                    <span>Sửa</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSelectedId(row.product_id)}>
                                    <FaTrash className="mr-2 h-4 w-4" />
                                    <span>Xóa</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <ChangeStatus
                        id={row.product_id}
                        isOpen={selectedId === row.product_id}
                        onClose={() => setSelectedId(null)}
                        onSuccess={fetchData}
                        endpoint="/api/products/update-status"
                        status={-2}
                        title="Xác nhận xóa sản phẩm"
                        description="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
                        confirmText="Xóa"
                        cancelText="Hủy"
                        successMessage="Xóa sản phẩm thành công"
                        errorMessage="Có lỗi xảy ra khi xóa sản phẩm"
                    />
                </>
            )
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="sticky top-0 z-20 bg-white shadow-lg">
                <Card className="rounded-none border-0">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="container mx-auto px-4 py-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <CardTitle className="text-2xl md:text-3xl font-bold">Quản lý sản phẩm</CardTitle>
                                <Link href="/quan-tri/quan-ly-san-pham/tao-moi">
                                    <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
                                        <FaPlus className="mr-2 h-4 w-4" />
                                        Thêm sản phẩm mới
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <div className="flex-1 container mx-auto px-4 py-8">
                <Card className="shadow-xl rounded-xl overflow-hidden">
                    <div className="p-6">
                        <DataTable
                            data={data?.data || []}
                            columns={columns}
                            loading={loading}
                            error={error ? new Error(error) : null}
                            filters={{
                                status: {
                                    value: selectedStatus,
                                    onChange: setSelectedStatus,
                                    options: [
                                        { label: 'Tất cả', value: 'all' },
                                        { label: 'Còn hàng', value: '1' },
                                        { label: 'Hết hàng', value: '0' },
                                    ]
                                },
                                search: {
                                    value: searchKeyword,
                                    onChange: setSearchKeyword,
                                    placeholder: "Tìm kiếm sản phẩm"
                                },
                                limit: {
                                    value: limit,
                                    onChange: setLimit,
                                    options: [4, 10, 20, 50, 100]
                                }
                            }}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Page;