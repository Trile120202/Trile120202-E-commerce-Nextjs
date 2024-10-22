'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCaption,
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
import { Switch } from "@/components/ui/switch"
import {CreateTagModal} from "@/components/CreateTagModal"
import {EditTagModal} from "@/components/EditTagModal"
import Loading from "@/components/Loading";
import { debounce } from 'lodash';
import useSWR from 'swr';

interface Tag {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  status: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: string;
  itemsPerPage: number;
}

interface TagsResponse {
  status: number;
  message: string;
  data: {
    tags: Tag[];
    pagination: Pagination;
  };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const Page = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState<string>('');
    const [limit, setLimit] = useState<number>(10);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

    const { data, error, mutate } = useSWR<TagsResponse>(
        `/api/tag?limit=${limit}&page=${currentPage}&search=${debouncedSearchKeyword}&status=${selectedStatus}`,
        fetcher
    );

    const loading = !data && !error;

    const debouncedSearch = useCallback(
        debounce((value: string) => {
            setDebouncedSearchKeyword(value);
            setCurrentPage(1);
        }, 2000),
        []
    );

    useEffect(() => {
        debouncedSearch(searchKeyword);
    }, [searchKeyword, debouncedSearch]);

    useEffect(() => {
        setCurrentPage(1);
        mutate();
    }, [selectedStatus, mutate]);

    const columns = [
        { accessor: 'id', label: 'ID', className: 'font-medium' },
        { accessor: 'name', label: 'Từ khóa', className: 'font-medium' },
        { accessor: 'created_at', label: 'Ngày tạo', className: 'text-right' },
        { accessor: 'updated_at', label: 'Ngày cập nhật', className: 'text-right' },
        { accessor: 'status', label: 'Trạng thái', className: 'text-center' },
        { accessor: 'actions', label: 'Thao tác', className: 'text-right' },
    ];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleEdit = (tag: Tag) => {
        setSelectedTag(tag);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: number) => {
        console.log(`Delete keyword with id: ${id}`);
    };

    const handleCreate = (newTag: Tag) => {
        console.log('New tag created:', newTag);
        mutate();
    };

    const handleUpdate = (updatedTag: Tag) => {
        console.log('Tag updated:', updatedTag);
        mutate();
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

            mutate();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusColor = (status: number) => {
        return status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const getStatusText = (status: number) => {
        return status === 1 ? 'Hoạt động' : 'Không hoạt động';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    if (loading) return <Loading />;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold">Quản lý từ khóa</CardTitle>
                    <CreateTagModal onCreate={handleCreate} />
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex space-x-4 mb-6">
                    <div className="relative">
                        <Select onValueChange={(value) => {
                            setSelectedStatus(value);
                            setCurrentPage(1);
                        }} defaultValue={selectedStatus}>
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
                            placeholder="Tìm kiếm từ khóa"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg"
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="relative">
                        <Select onValueChange={(value) => setLimit(Number(value))} defaultValue={limit.toString()}>
                            <SelectTrigger className="w-[150px] border-2 border-gray-300 rounded-lg">
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
                            {data?.data.tags.map((row, index) => (
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
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
                                                        {getStatusText(row.status)}
                                                    </span>
                                                </div>
                                            ) : col.accessor === 'created_at' || col.accessor === 'updated_at' ? (
                                                formatDate(row[col.accessor])
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
                <Pagination className="mt-6">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                href="#" 
                                onClick={() => handlePageChange(currentPage - 1)}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>
                        {[...Array(data?.data.pagination.totalPages)].map((_, index) => (
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
                                className={currentPage === data?.data.pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </CardContent>
            {isEditModalOpen && selectedTag && (
                <EditTagModal
                    tag={selectedTag}
                    onUpdate={handleUpdate}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </Card>
    );
};

export default Page;