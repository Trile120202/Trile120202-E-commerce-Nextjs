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
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa'
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Storage {
    id: number;
    name: string;
    type: string;
    capacity: number;
    interface: string;
    brand: string;
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
    data: Storage[];
    pagination: Pagination;
}

const Page = () => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [data, setData] = useState<Storage[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(false);

    const columns = [
        { accessor: 'id', label: 'ID', className: 'font-medium' },
        { accessor: 'name', label: 'Tên ổ cứng', className: 'font-medium' },
        { accessor: 'type', label: 'Loại', className: 'text-center' },
        { accessor: 'capacity', label: 'Dung lượng', className: 'text-right' },
        { accessor: 'interface', label: 'Chuẩn kết nối', className: 'text-center' },
        { accessor: 'brand', label: 'Hãng', className: 'text-center' },
        { accessor: 'status', label: 'Trạng thái', className: 'text-center' },
        { accessor: 'actions', label: 'Thao tác', className: 'text-right' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/storages?page=${currentPage}&search=${searchKeyword}${selectedStatus !== 'all' ? `&status=${selectedStatus}` : ''}`);
                const result: ApiResponse = await response.json();
                setData(result.data);
                setPagination(result.pagination);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            setLoading(false);
        };

        fetchData();
    }, [currentPage, selectedStatus, searchKeyword]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleEdit = (id: number) => {
        router.push(`/quan-tri/quan-ly-o-cung/${id}`);
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/storages?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setData(data.filter(item => item.id !== id));
            }
        } catch (error) {
            console.error('Error deleting storage:', error);
        }
    };

    const getStatusColor = (status: number) => {
        return status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold">Quản lý ổ cứng</CardTitle>
                    <Link href="/quan-tri/quan-ly-o-cung/tao-moi">
                        <Button className="bg-green-500 hover:bg-green-600 transition duration-300">
                            <FaPlus className="mr-2 h-4 w-4" />
                            Tạo mới
                        </Button>
                    </Link>
                </div>
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
                                <SelectItem value="1">Hoạt động</SelectItem>
                                <SelectItem value="0">Không hoạt động</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative w-64">
                        <Input
                            placeholder="Tìm kiếm ổ cứng"
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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center py-4">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : data.map((row, index) => (
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
                                                            <span>Xóa</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : col.accessor === 'status' ? (
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
                                                    {row.status === 1 ? 'Hoạt động' : 'Không hoạt động'}
                                                </span>
                                            ) : col.accessor === 'capacity' ? (
                                                `${row[col.accessor]}`
                                            ) : (
                                                row[col.accessor as keyof Storage]
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {pagination && (
                    <Pagination className="mt-6">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    className={pagination.currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                            {[...Array(pagination.totalPages)].map((_, index) => (
                                <PaginationItem key={index}>
                                    <PaginationLink 
                                        onClick={() => handlePageChange(index + 1)}
                                        isActive={pagination.currentPage === index + 1}
                                    >
                                        {index + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext 
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    className={pagination.currentPage === pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
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
