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

interface CPU {
    id: number;
    name: string;
    brand: string;
    model: string;
    cores: number;
    threads: number;
    base_clock: string;
    boost_clock: string;
    cache: string;
    created_at: string;
    updated_at: string;
    status: number;
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
    data: CPU[];
    pagination: Pagination;
}

const Page = () => {
    const router = useRouter();
    const { toast } = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedBrand, setSelectedBrand] = useState<string>('all');
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [limit, setLimit] = useState<number>(10);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { data, loading, error, fetchData } = useApi<ApiResponse>(
        `/api/cpus?page=${currentPage}&limit=${limit}&search=${searchKeyword}${selectedStatus !== 'all' ? `&status=${selectedStatus}` : ''}${selectedBrand !== 'all' ? `&brand=${selectedBrand}` : ''}`,
        {
            method: 'GET'
        }
    );

    useEffect(() => {
        fetchData();
    }, [currentPage, selectedStatus, selectedBrand, searchKeyword, limit]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleEdit = (id: number) => {
        router.push(`/quan-tri/quan-ly-cpu/${id}`);
    };

    const getStatusColor = (status: number) => {
        return status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const columns = [
        { accessor: 'id', label: 'ID', className: 'font-medium' },
        { accessor: 'name', label: 'Tên CPU', className: 'font-medium' },
        { accessor: 'brand', label: 'Hãng sản xuất', className: 'font-medium' },
        { accessor: 'model', label: 'Model', className: 'font-medium' },
        { accessor: 'cores', label: 'Số nhân', render: (row: CPU) => `${row.cores} nhân` },
        { accessor: 'threads', label: 'Số luồng', render: (row: CPU) => `${row.threads} luồng` },
        { accessor: 'base_clock', label: 'Xung cơ bản', render: (row: CPU) => `${row.base_clock}` },
        { accessor: 'boost_clock', label: 'Xung tăng cường', render: (row: CPU) => `${row.boost_clock}` },
        { accessor: 'cache', label: 'Cache', className: 'font-medium' },
        { 
            accessor: 'status', 
            label: 'Trạng thái', 
            className: 'text-center hidden md:table-cell',
            render: (row: CPU) => (
                <span className={`hidden md:inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
                    {row.status === 1 ? 'Hoạt động' : 'Không hoạt động'}
                </span>
            )
        },
        { 
            accessor: 'actions', 
            label: 'Thao tác', 
            className: 'text-right',
            render: (row: CPU) => (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <BsThreeDots className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(row.id)}>
                                <FaEdit className="mr-2 h-4 w-4" />
                                <span>Sửa</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedId(row.id)}>
                                <FaTrash className="mr-2 h-4 w-4" />
                                <span>Xóa</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <ChangeStatus
                        id={row.id}
                        isOpen={selectedId === row.id}
                        onClose={() => setSelectedId(null)}
                        onSuccess={fetchData}
                        endpoint="/api/cpus/update-status"
                        status={-2}
                        title="Xác nhận xóa CPU"
                        description="Bạn có chắc chắn muốn xóa CPU này? Hành động này không thể hoàn tác."
                        confirmText="Xóa"
                        cancelText="Hủy"
                        successMessage="Xóa CPU thành công"
                        errorMessage="Có lỗi xảy ra khi xóa CPU"
                    />
                </>
            )
        },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="sticky top-0 z-20 bg-white shadow-sm">
                <Card className="rounded-none shadow-none border-0">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 md:p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                            <CardTitle className="text-xl md:text-2xl font-bold">Quản lý CPU</CardTitle>
                            <Link href="/quan-tri/quan-ly-cpu/tao-moi" className="w-full md:w-auto">
                                <Button className="w-full md:w-auto bg-green-500 hover:bg-green-600 transition duration-300">
                                    <FaPlus className="mr-2 h-4 w-4" />
                                    Tạo mới
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <div className="flex-1 overflow-auto">
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
                                { label: 'Hoạt động', value: '1' },
                                { label: 'Không hoạt động', value: '0' },
                            ]
                        },
                        brand: {
                            value: selectedBrand,
                            onChange: setSelectedBrand,
                            options: [
                                { label: 'Tất cả', value: 'all' },
                                { label: 'Intel', value: 'Intel' },
                                { label: 'AMD', value: 'AMD' },
                            ]
                        },
                        search: {
                            value: searchKeyword,
                            onChange: setSearchKeyword,
                            placeholder: "Tìm kiếm CPU"
                        },
                        limit: {
                            value: limit,
                            onChange: setLimit,
                            options: [4, 10, 20, 50, 100]
                        }
                    }}
                />
            </div>

            <div className="sticky bottom-0 bg-white border-t z-10">
                {data?.pagination && (
                    <div className="p-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        onClick={() => handlePageChange(data.pagination.currentPage - 1)}
                                        className={data.pagination.currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                
                                {[...Array(data.pagination.totalPages)].map((_, index) => {
                                    if (index === 0) return (
                                        <PaginationItem key={index}>
                                            <PaginationLink 
                                                onClick={() => handlePageChange(index + 1)}
                                                isActive={data.pagination.currentPage === index + 1}
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
                                        className={data.pagination.currentPage === data.pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
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