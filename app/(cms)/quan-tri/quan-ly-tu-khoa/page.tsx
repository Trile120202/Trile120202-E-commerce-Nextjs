'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
    PaginationEllipsis,
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
import { Switch } from "@/components/ui/switch"
import {CreateTagModal} from "@/components/CreateTagModal"
import {EditTagModal} from "@/components/EditTagModal"
import useApi from '@/lib/useApi';

interface Tag {
    id: number;
    name: string;
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
    data: {
        tags: Tag[];
        pagination: Pagination;
    };
}

const Page = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [limit, setLimit] = useState<number>(10);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

    const { data, loading, error, fetchData } = useApi<ApiResponse>(`/api/tag?page=${currentPage}&limit=${limit}&search=${searchKeyword}${selectedStatus !== 'all' ? `&status=${selectedStatus}` : ''}`, {
        method: 'GET'
    });

    useEffect(() => {
        fetchData();
    }, [currentPage, selectedStatus, searchKeyword, limit]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleEdit = (tag: Tag) => {
        setSelectedTag(tag);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: number) => {
        console.log(`Delete tag with id: ${id}`);
    };

    const handleCreate = (newTag: Tag) => {
        console.log('New tag created:', newTag);
        fetchData();
    };

    const handleUpdate = (updatedTag: Tag) => {
        console.log('Tag updated:', updatedTag);
        fetchData();
        setIsEditModalOpen(false);
    };

    const handleStatusChange = async (id: number, newStatus: number) => {
        try {
            const response = await fetch('/api/tag', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusColor = (status: number) => {
        return status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const columns = [
        { accessor: 'id', label: 'ID', className: 'font-medium' },
        { accessor: 'name', label: 'Từ khóa', className: 'font-medium' },
        { accessor: 'status', label: 'Trạng thái', className: 'text-center hidden md:table-cell' },
        { accessor: 'actions', label: 'Thao tác', className: 'text-right' },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="sticky top-0 z-20 bg-white shadow-sm">
                <Card className="rounded-none shadow-none border-0">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 md:p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                            <CardTitle className="text-xl md:text-2xl font-bold">Quản lý từ khóa</CardTitle>
                            <CreateTagModal onCreate={handleCreate} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-auto">
                                <Select onValueChange={setSelectedStatus} defaultValue="all">
                                    <SelectTrigger className="w-full md:w-[200px] border-2 border-gray-300 rounded-lg">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="1">Hoạt động</SelectItem>
                                        <SelectItem value="0">Không hoạt động</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Input
                                    placeholder="Tìm kiếm từ khóa"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                            <div className="w-full md:w-auto">
                                <Select onValueChange={(value) => setLimit(Number(value))} defaultValue={limit.toString()}>
                                    <SelectTrigger className="w-full md:w-[150px] border-2 border-gray-300 rounded-lg">
                                        <SelectValue placeholder="Số lượng hiển thị" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="4">4</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex-1 overflow-auto">
                <Card className="rounded-none shadow-none border-0">
                    <CardContent className="p-4 md:p-6">
                        <div className="overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader className="sticky top-0 bg-white">
                                    <TableRow>
                                        {columns.map((col, index) => (
                                            <TableHead key={index} className={`${col.className} py-3 text-sm md:text-base bg-gray-100`}>
                                                {col.label}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="overflow-y-auto">
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="text-center py-4">
                                                Đang tải...
                                            </TableCell>
                                        </TableRow>
                                    ) : error ? (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="text-center py-4 text-red-500">
                                                Đã xảy ra lỗi khi tải dữ liệu.
                                            </TableCell>
                                        </TableRow>
                                    ) : !data?.data.tags || data.data.tags.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="text-center py-4">
                                                Không có dữ liệu.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.data.tags.map((row, index) => (
                                            <TableRow key={index} className="hover:bg-gray-50 transition duration-150">
                                                {columns.map((col, colIndex) => (
                                                    <TableCell 
                                                        key={colIndex} 
                                                        className={`${col.className} py-4 text-sm md:text-base`}
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
                                                                    <DropdownMenuItem onClick={() => handleEdit(row)}>
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
                                                            <div className="flex items-center space-x-2">
                                                                <Switch
                                                                    checked={row.status === 1}
                                                                    onCheckedChange={(checked) => handleStatusChange(row.id, checked ? 1 : 0)}
                                                                />
                                                                <span className={`hidden md:inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
                                                                    {row.status === 1 ? 'Hoạt động' : 'Không hoạt động'}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            row[col.accessor as keyof typeof row]
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="sticky bottom-0 bg-white border-t z-10">
                {data?.data.pagination && (
                    <div className="p-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        onClick={() => handlePageChange(data.data.pagination.currentPage - 1)}
                                        className={data.data.pagination.currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                
                                {[...Array(data.data.pagination.totalPages)].map((_, index) => {
                                    if (index === 0) return (
                                        <PaginationItem key={index}>
                                            <PaginationLink 
                                                onClick={() => handlePageChange(index + 1)}
                                                isActive={data.data.pagination.currentPage === index + 1}
                                            >
                                                {index + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                    
                                    if (
                                        index === data.data.pagination.currentPage - 1 ||
                                        index === data.data.pagination.currentPage - 2 ||
                                        index === data.data.pagination.currentPage
                                    ) return (
                                        <PaginationItem key={index}>
                                            <PaginationLink 
                                                onClick={() => handlePageChange(index + 1)}
                                                isActive={data.data.pagination.currentPage === index + 1}
                                            >
                                                {index + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                    
                                    if (index === data.data.pagination.totalPages - 1) return (
                                        <PaginationItem key={index}>
                                            <PaginationLink 
                                                onClick={() => handlePageChange(index + 1)}
                                                isActive={data.data.pagination.currentPage === index + 1}
                                            >
                                                {index + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                    
                                    if (
                                        index === 1 ||
                                        index === data.data.pagination.totalPages - 2
                                    ) return (
                                        <PaginationItem key={index}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )
                                    
                                    return null
                                })}

                                <PaginationItem>
                                    <PaginationNext 
                                        onClick={() => handlePageChange(data.data.pagination.currentPage + 1)}
                                        className={data.data.pagination.currentPage === data.data.pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {isEditModalOpen && selectedTag && (
                <EditTagModal
                    tag={selectedTag}
                    onUpdate={handleUpdate}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Page;