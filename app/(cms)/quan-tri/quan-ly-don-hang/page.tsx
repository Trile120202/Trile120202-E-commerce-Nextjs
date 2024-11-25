'use client';

import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { FaEdit, FaTrash, FaPlus, FaSearch, FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaCheck } from 'react-icons/fa'
import { BsThreeDots } from 'react-icons/bs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useApi from '@/lib/useApi';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
    product_name: string;
    product_image: string;
    slug: string;
}

interface Order {
    id: number;
    user_id: number;
    payment_method_id: number;
    delivery_address_id: number;
    status: number;
    total_amount: number;
    created_at: string;
    customer_name: string;
    full_name: string;
    customer_email: string;
    payment_method_name: string;
    payment_method_icon: string;
    address: string;
    phone_number: string;
    province_name: string;
    district_name: string;
    ward_name: string;
    items: OrderItem[];
}

interface ApiResponse {
    status: number;
    message: string;
    data: Order[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}

const Page = () => {
    const router = useRouter();
    const { toast } = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [limit] = useState<number>(10);

    const { data, loading, error, fetchData } = useApi<ApiResponse>(
        `/api/orders/get-list-order?page=${currentPage}&limit=${limit}&search=${searchKeyword}${selectedStatus !== 'all' ? `&status=${selectedStatus}` : ''}`,
        {
            method: 'GET'
        }
    );

    useEffect(() => {
        fetchData();
    }, [currentPage, selectedStatus, searchKeyword]);

    const columns = [
        { accessor: 'full_name', label: 'Tên khách hàng', className: 'font-medium' },
        { accessor: 'created_at', label: 'Ngày đặt hàng', className: 'text-center' },
        { accessor: 'total_amount', label: 'Tổng tiền', className: 'text-right' },
        { accessor: 'status', label: 'Trạng thái', className: 'text-center' },
        { accessor: 'actions', label: 'Thao tác', className: 'text-right' },
    ];

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= (data?.pagination.totalPages || 1)) {
            setCurrentPage(page);
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/quan-tri/quan-ly-don-hang/${id}`);
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch('/api/orders/update-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    status: 5
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Có lỗi xảy ra khi hủy đơn hàng');
            }

            toast({
                title: "Thành công",
                description: "Hủy đơn hàng thành công",
            });

            fetchData();

        } catch (error) {
            console.error('Error canceling order:', error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: (error as Error).message || "Có lỗi xảy ra khi hủy đơn hàng",
            });
        }
    };

    const handleCreate = () => {
        router.push('/quan-tri/quan-ly-don-hang/tao-moi');
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
            case 9: return 'Thành công';
            default: return 'Không xác định';
        }
    };

    const getStatusColor = (status: number) => {
        switch(status) {
            case 1: return 'text-yellow-500 bg-yellow-100';
            case 2: return 'text-blue-500 bg-blue-100';
            case 3: return 'text-purple-500 bg-purple-100';
            case 4: return 'text-green-500 bg-green-100';
            case 5: return 'text-red-500 bg-red-100';
            case 6: return 'text-orange-500 bg-orange-100';
            case 7: return 'text-emerald-500 bg-emerald-100';
            case 8: return 'text-rose-500 bg-rose-100';
            case 9: return 'text-green-600 bg-green-100';
            default: return 'text-gray-500 bg-gray-100';
        }
    };

    const getStatusIcon = (status: number) => {
        switch(status) {
            case 1: return <FaBox className="mr-2 h-4 w-4" />;
            case 2: return <FaTruck className="mr-2 h-4 w-4 animate-pulse" />;
            case 3: return <FaTruck className="mr-2 h-4 w-4" />;
            case 4: return <FaCheckCircle className="mr-2 h-4 w-4" />;
            case 5: return <FaTimesCircle className="mr-2 h-4 w-4" />;
            case 6: return <FaBox className="mr-2 h-4 w-4 animate-pulse" />;
            case 7: return <FaCheckCircle className="mr-2 h-4 w-4" />;
            case 8: return <FaTimesCircle className="mr-2 h-4 w-4" />;
            case 9: return <FaCheck className="mr-2 h-4 w-4" />;
            default: return null;
        }
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {/* <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold">Quản lý đơn hàng</CardTitle>
                    <Button onClick={handleCreate} className="bg-green-500 hover:bg-green-600 transition duration-300">
                        <FaPlus className="mr-2 h-4 w-4" />
                        Tạo mới
                    </Button>
                </div> */}
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex space-x-4 mb-6">
                    <div className="relative">
                        <Select onValueChange={setSelectedStatus} defaultValue="all">
                            <SelectTrigger className="w-[200px] border-2 border-gray-300 rounded-lg">
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="1">Chờ xác nhận</SelectItem>
                                <SelectItem value="2">Đang xử lý</SelectItem>
                                <SelectItem value="3">Đang giao hàng</SelectItem>
                                <SelectItem value="5">Đã hủy</SelectItem>
                                <SelectItem value="9">Thành công</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative w-64">
                        <Input
                            placeholder="Tìm kiếm khách hàng"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg"
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                {columns.map((col, index) => (
                                    <TableHead key={index} className={`${col.className} py-3`}>
                                        {col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.data.map((row, index) => (
                                <TableRow key={index} className="hover:bg-gray-50 transition duration-150">
                                    {columns.map((col, colIndex) => (
                                        <TableCell 
                                            key={colIndex} 
                                            className={`${col.className} py-4`}
                                        >
                                            {col.accessor === 'actions' ? (
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
                                                        <DropdownMenuItem onClick={() => handleDelete(row.id)}>
                                                            <FaTrash className="mr-2 h-4 w-4" />
                                                            <span>Hủy</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : col.accessor === 'status' ? (
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center ${getStatusColor(row.status)}`}>
                                                    {getStatusIcon(row.status)}
                                                    {getStatusText(row.status)}
                                                </span>
                                            ) : col.accessor === 'total_amount' ? (
                                                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                                                    .format(row.total_amount)
                                            ) : col.accessor === 'created_at' ? (
                                                new Date(row.created_at).toLocaleDateString('vi-VN')
                                            ) : (
                                                row[col.accessor as keyof typeof row]
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {data?.pagination && (
                    <Pagination className="mt-6">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    href="#" 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                            {[...Array(data.pagination.totalPages)].map((_, index) => (
                                <PaginationItem key={index}>
                                    <PaginationLink 
                                        href="#"
                                        onClick={() => handlePageChange(index + 1)}
                                        isActive={currentPage === index + 1}
                                    >
                                        {index + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext 
                                    href="#" 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className={currentPage === data.pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </CardContent>
        </Card>
    );
};

export default Page;