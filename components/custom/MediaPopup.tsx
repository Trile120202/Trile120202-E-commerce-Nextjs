'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ImageIcon, ImagePlus, Images } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { FaSearch } from 'react-icons/fa';
import { UploadDropzone } from "@/components/custom/uploadthing";
import useApi from '@/lib/useApi';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

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

interface MediaPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect?: (image: Image | Image[]) => void;
    multiple?: boolean;
}

function MediaPopup({ open, onOpenChange, onSelect, multiple = false }: MediaPopupProps) {
    const [selectedImage, setSelectedImage] = useState<Image | null>(null);
    const [selectedImages, setSelectedImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(12);
    const [uploadedImages, setUploadedImages] = useState<{url: string, name: string}[]>([]);

    const { data, fetchData } = useApi<ApiResponse>(`/api/image?page=${currentPage}&limit=${limit}&search=${searchKeyword}`, {
        method: 'GET'
    });

    useEffect(() => {
        fetchData();
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

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        }
    };

    const handleImageClick = (image: Image) => {
        if (multiple) {
            if (selectedImages.find(img => img.id === image.id)) {
                setSelectedImages(selectedImages.filter(img => img.id !== image.id));
            } else {
                setSelectedImages([...selectedImages, image]);
            }
        } else {
            setSelectedImage(image);
        }
    };

    const handleSelect = () => {
        if (onSelect) {
            if (multiple) {
                onSelect(selectedImages);
            } else if (selectedImage) {
                onSelect(selectedImage);
            }
            onOpenChange(false);
        }
    };

    const renderPaginationItems = () => {
        const items = [];
        const totalPages = data?.pagination.totalPages || 0;
        const maxVisiblePages = 3;
        
        items.push(
            <PaginationItem key="prev">
                <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
            </PaginationItem>
        );

        items.push(
            <PaginationItem key={1}>
                <PaginationLink 
                    onClick={() => setCurrentPage(1)}
                    isActive={currentPage === 1}
                >
                    1
                </PaginationLink>
            </PaginationItem>
        );

        if (totalPages > maxVisiblePages) {
            if (currentPage > 3) {
                items.push(
                    <PaginationItem key="ellipsis1">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink 
                            onClick={() => setCurrentPage(i)}
                            isActive={currentPage === i}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            if (currentPage < totalPages - 2) {
                items.push(
                    <PaginationItem key="ellipsis2">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
        } else {
            for (let i = 2; i < totalPages; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink 
                            onClick={() => setCurrentPage(i)}
                            isActive={currentPage === i}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        }

        if (totalPages > 1) {
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink 
                        onClick={() => setCurrentPage(totalPages)}
                        isActive={currentPage === totalPages}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        items.push(
            <PaginationItem key="next">
                <PaginationNext 
                    onClick={() => setCurrentPage(prev => prev < totalPages ? prev + 1 : prev)}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
            </PaginationItem>
        );

        return items;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Quản lý hình ảnh</DialogTitle>
                    <DialogDescription>
                        Tải lên hoặc chọn hình ảnh có sẵn {multiple ? '(Có thể chọn nhiều ảnh)' : ''}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="upload" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                            <ImagePlus className="h-3 w-3" />
                            <span>Tải lên</span>
                        </TabsTrigger>
                        <TabsTrigger value="library" className="flex items-center gap-2">
                            <Images className="h-3 w-3" />
                            <span>Thư viện</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="mt-4">
                        <div className="w-full max-w-[300px] mx-auto">
                            <UploadDropzone
                                endpoint="imageUploader"
                                onClientUploadComplete={(res: any[]) => {
                                    if (res && res.length > 0) {
                                        const newImages = res.map(file => ({
                                            url: file.url,
                                            name: file.name
                                        }));
                                        setUploadedImages([...uploadedImages, ...newImages]);
                                        res.forEach((file) => {
                                            handleUpload(file.url, file.name);
                                        });
                                        alert("Upload Completed");
                                    }
                                }}
                                onUploadError={(error: Error) => {
                                    alert(`ERROR! ${error.message}`);
                                }}
                            />
                        </div>
                        {uploadedImages.length > 0 && (
                            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {uploadedImages.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={image.url}
                                            alt={image.name}
                                            className="w-full h-[200px] object-cover rounded-lg shadow-md"
                                        />
                                        <p className="mt-2 text-sm text-center text-gray-600 truncate">
                                            {image.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="library" className="mt-4">
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

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {data?.data?.map((image) => (
                                <div
                                    key={image.id}
                                    className={`relative group cursor-pointer ${
                                        multiple 
                                            ? selectedImages.find(img => img.id === image.id) ? 'ring-2 ring-primary' : ''
                                            : selectedImage?.id === image.id ? 'ring-2 ring-primary' : ''
                                    }`}
                                    onClick={() => handleImageClick(image)}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.alt_text}
                                        className="w-full h-[200px] object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                                        <p className="text-white text-sm">{image.alt_text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
                            <Pagination>
                                <PaginationContent>
                                    {renderPaginationItems()}
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-4 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSelect}
                        disabled={(multiple ? selectedImages.length === 0 : !selectedImage) || loading}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                <span>Đang xử lý</span>
                            </div>
                        ) : (
                            'Chọn'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default MediaPopup;