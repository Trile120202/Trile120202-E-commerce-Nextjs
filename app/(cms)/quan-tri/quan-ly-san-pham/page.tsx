'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
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

interface Product {
    product_id: number;
    product_name: string;
    categories: string;
    price: string;
    stock_quantity: number;
    product_status: number;
    product_created_at: string;
    product_updated_at: string;
}

interface Pagination {
    currentPage: number;
    pageSize: number;
    totalItems: string;
    totalPages: number;
}

interface ApiResponse {
    status: number;
    message: string;
    data: Product[];
    pagination: Pagination;
}

const Page = () => {
    const router = useRouter();
    const { toast } = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [limit, setLimit] = useState<number>(10);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { data, loading, error, fetchData } = useApi<ApiResponse>(
        `/api/products?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchKeyword)}${selectedStatus !== 'all' ? `&status=${selectedStatus}` : ''}${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`,
        {
            method: 'GET'
        }
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
    }, [currentPage, selectedStatus, selectedCategory, searchKeyword, limit]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleEdit = (id: number) => {
        router.push(`/quan-tri/quan-ly-san-pham/${id}`);
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch('/api/products/update-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    status: -2
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Có lỗi xảy ra khi xóa sản phẩm');
            }

            toast({
                title: "Thành công",
                description: "Xóa sản phẩm thành công",
            });

            fetchData();

        } catch (error) {
            console.error('Error deleting product:', error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: (error as Error).message || "Có lỗi xảy ra khi xóa sản phẩm",
            });
        }
    };

    const getStatusColor = (status: number) => {
        return status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const columns = [
        { accessor: 'product_id', label: 'ID', className: 'font-medium' },
        { accessor: 'product_name', label: 'Tên sản phẩm', className: 'font-medium' },
        { accessor: 'categories', label: 'Danh mục', className: 'text-center' },
        { accessor: 'price', label: 'Giá', className: 'text-right' },
        { accessor: 'stock_quantity', label: 'Tồn kho', className: 'text-right' },
        {
            accessor: 'product_status',
            label: 'Trạng thái',
            className: 'text-center hidden md:table-cell',
            render: (row: Product) => (
                <span className={`hidden md:inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.product_status)}`}>
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
                            className="hidden md:flex items-center gap-2"
                        >
                            <FaEdit className="h-4 w-4" />
                            Sửa
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setSelectedId(row.product_id)}
                            className="hidden md:flex items-center gap-2"
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
            <div className="sticky top-0 z-20 bg-white shadow">
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
                <Card className="shadow-lg">
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

            <div className="sticky bottom-0 bg-white border-t shadow-lg">
                {data?.pagination && (
                    <div className="container mx-auto px-4 py-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(data.pagination.currentPage - 1)}
                                        className={`${data.pagination.currentPage === 1 ? 'pointer-events-none opacity-50' : ''} hover:bg-gray-100`}
                                    />
                                </PaginationItem>

                                {[...Array(data.pagination.totalPages)].map((_, index) => {
                                    if (index === 0) return (
                                        <PaginationItem key={index}>
                                            <PaginationLink
                                                onClick={() => handlePageChange(index + 1)}
                                                isActive={data.pagination.currentPage === index + 1}
                                                className="hover:bg-gray-100"
                                            >
                                                {index + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )

                                    if (
                                        index === data.pagination.currentPage - 1 ||
                                        index === data.pagination.currentPage - 2 ||
                                        index === data.pagination.currentPage
                                    ) return (
                                        <PaginationItem key={index}>
                                            <PaginationLink
                                                onClick={() => handlePageChange(index + 1)}
                                                isActive={data.pagination.currentPage === index + 1}
                                                className="hover:bg-gray-100"
                                            >
                                                {index + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )

                                    if (index === data.pagination.totalPages - 1) return (
                                        <PaginationItem key={index}>
                                            <PaginationLink
                                                onClick={() => handlePageChange(index + 1)}
                                                isActive={data.pagination.currentPage === index + 1}
                                                className="hover:bg-gray-100"
                                            >
                                                {index + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )

                                    if (
                                        index === 1 ||
                                        index === data.pagination.totalPages - 2
                                    ) return (
                                        <PaginationItem key={index}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )

                                    return null
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(data.pagination.currentPage + 1)}
                                        className={`${data.pagination.currentPage === data.pagination.totalPages ? 'pointer-events-none opacity-50' : ''} hover:bg-gray-100`}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;