'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { FaEdit, FaTrash } from 'react-icons/fa'
import { BsThreeDots } from 'react-icons/bs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {CreateTagModal} from "@/components/CreateTagModal"
import {EditTagModal} from "@/components/EditTagModal"
import useApi from '@/lib/useApi';
import DataTable from "@/components/custom/datatable";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { useRouter, useSearchParams } from 'next/navigation';

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
    const router = useRouter();
    const searchParams = useSearchParams();

    const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
    const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'all');
    const [searchKeyword, setSearchKeyword] = useState<string>(searchParams.get('search') || '');
    const [limit, setLimit] = useState<number>(Number(searchParams.get('limit')) || 10);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

    const updateUrl = (params: Record<string, string | number>) => {
        const url = new URL(window.location.href);
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                url.searchParams.set(key, String(value));
            } else {
                url.searchParams.delete(key);
            }
        });
        router.push(url.pathname + url.search);
    };

    const { data, loading, error, fetchData } = useApi<ApiResponse>(`/api/tag?page=${currentPage}&limit=${limit}&search=${searchKeyword}${selectedStatus !== 'all' ? `&status=${selectedStatus}` : ''}`, {
        method: 'GET'
    });

    useEffect(() => {
        fetchData();
        updateUrl({
            page: currentPage,
            limit,
            search: searchKeyword,
            status: selectedStatus !== 'all' ? selectedStatus : ''
        });
    }, [currentPage, selectedStatus, searchKeyword, limit]);

    const handleEdit = (tag: Tag) => {
        setSelectedTag(tag);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: number) => {
        console.log(`Delete tag with id: ${id}`);
    };

    const handleCreate = (newTag: Tag) => {
        console.log('New tag created:', newTag);
    setTimeout(() => {
    window.location.reload();
    }, 1200);
        
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (search: string) => {
        setSearchKeyword(search);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (status: string) => {
        setSelectedStatus(status);
        setCurrentPage(1);
    };

    const getStatusColor = (status: number) => {
        return status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const columns = [
        { accessor: 'id', label: 'ID', className: 'font-medium' },
        { accessor: 'name', label: 'Từ khóa', className: 'font-medium' },
        {
            accessor: 'status',
            label: 'Trạng thái',
            className: 'text-center hidden md:table-cell',
            render: (row: Tag) => (
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={row.status === 1}
                        onCheckedChange={(checked) => handleStatusChange(row.id, checked ? 1 : 0)}
                    />
                    <span className={`hidden md:inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
                        {row.status === 1 ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                </div>
            )
        },
        {
            accessor: 'actions',
            label: 'Thao tác',
            className: 'text-right',
            render: (row: Tag) => (
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
            )
        },
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
                </Card>
            </div>

            <div className="flex-1 overflow-auto">
                <DataTable
                    data={data?.data.tags || []}
                    columns={columns}
                    loading={loading}
                    error={error ? new Error(error) : null}
                    filters={{
                        status: {
                            value: selectedStatus,
                            onChange: handleStatusFilterChange,
                            options: [
                                { label: 'Tất cả', value: 'all' },
                                { label: 'Hoạt động', value: '1' },
                                { label: 'Không hoạt động', value: '0' },
                            ]
                        },
                        search: {
                            value: searchKeyword,
                            onChange: handleSearchChange,
                            placeholder: "Tìm kiếm từ khóa"
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