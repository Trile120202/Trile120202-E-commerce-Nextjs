'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaSearch, FaTrash } from 'react-icons/fa';
import { UploadDropzone} from "@/components/custom/uploadthing";
import useApi from '@/lib/useApi';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Image {
    id: number;
    url: string;
    alt_text: string;
    created_at: string;
    updated_at: string;
    status: number;
}

interface ApiResponse {
    status: number;
    message: string;
    data: Image[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}

const Page = () => {
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

    const { data, fetchData } = useApi<ApiResponse>(`/api/image?page=${currentPage}&limit=${limit}&search=${searchKeyword}`, {
        method: 'GET'
    });

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchData();
            setLoading(false);
        };
        loadData();
    }, [currentPage, limit, searchKeyword]);

    const handleUpload = async (url: string, alt_text: string) => {
        try {
            const response = await fetch('/api/image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url,
                    alt_text
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            fetchData();
            toast({
                title: "Thành công",
                description: "Tải lên hình ảnh thành công",
            });

        } catch (error) {
            console.error('Error uploading image:', error);
            toast({
                title: "Thất bại",
                description: "Tải lên hình ảnh thất bại",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch('/api/image/update-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    status: -2
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete image');
            }

            fetchData();
            toast({
                title: "Thành công",
                description: "Xóa hình ảnh thành công",
            });

        } catch (error) {
            console.error('Error deleting image:', error);
            toast({
                title: "Thất bại", 
                description: "Xóa hình ảnh thất bại",
                variant: "destructive",
            });
        }
    };

    const openDeleteDialog = (id: number) => {
        setSelectedImageId(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (selectedImageId) {
            handleDelete(selectedImageId);
        }
        setShowDeleteDialog(false);
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold">Quản lý Media</CardTitle>
                    <UploadDropzone
                        endpoint="imageUploader"
                        onClientUploadComplete={(res: any[]) => {
                            if (res && res.length > 0) {
                                res.forEach((file) => {
                                    handleUpload(file.url, file.name);
                                });
                            }
                        }}
                        onUploadError={(error: Error) => {
                            toast({
                                title: "Thất bại",
                                description: error.message,
                                variant: "destructive",
                            });
                        }}
                    />
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="mb-6">
                    <div className="relative w-64">
                        <Input
                            placeholder="Tìm kiếm hình ảnh"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg"
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {loading ? (
                        Array(limit).fill(0).map((_, index) => (
                            <div key={index} className="flex flex-col gap-2">
                                <Skeleton className="w-[130px] h-[250px] rounded-lg" />
                            </div>
                        ))
                    ) : (
                        data?.data?.map((image) => (
                            <div key={image.id} className="relative group">
                                <a href={image.url} target="_blank" rel="noopener noreferrer" className="relative group flex justify-center items-center">
                                    <img 
                                        src={image.url} 
                                        alt={image.alt_text} 
                                        width={130} 
                                        height={250} 
                                        className="w-[130px] h-[250px] object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                                        <p className="text-white text-sm">{image.url}</p>
                                    </div>
                                </a>
                                <button
                                    onClick={() => openDeleteDialog(image.id)}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                                >
                                    <FaTrash className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <div className="flex justify-between items-center mt-6">
                    <Button 
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1 || loading}
                    >
                        Previous
                    </Button>
                    <span>Page {currentPage} of {data?.pagination.totalPages || 1}</span>
                    <Button
                        onClick={() => setCurrentPage((prev) => (data?.pagination.totalPages && data.pagination.totalPages > 0 && prev < data.pagination.totalPages) ? prev + 1 : prev)}
                        disabled={loading || (data?.pagination.totalPages !== undefined && data.pagination.totalPages > 0 && currentPage >= data.pagination.totalPages)}
                    >
                        Next
                    </Button>
                </div>
            </CardContent>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa hình ảnh này không?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Xóa</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};

export default Page;