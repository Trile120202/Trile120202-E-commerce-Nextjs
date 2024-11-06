'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {  FaSearch } from 'react-icons/fa';
import { UploadDropzone} from "@/components/custom/uploadthing";
import useApi from '@/lib/useApi';
import  Image  from 'next/image';


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
                                alert("Upload Completed");
                            }
                        }}
                        onUploadError={(error: Error) => {
                            alert(`ERROR! ${error.message}`);
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
                    {data?.data?.map((image) => (
                        <a key={image.id} href={image.url} target="_blank" rel="noopener noreferrer" className="relative group flex justify-center items-center">
                            {/*<Image src={image.url} alt={image.url} width={200} height={200} className="w-full h-auto rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105" />*/}

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
                    ))}
                </div>
                <div className="flex justify-between items-center mt-6">
                    <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                        Previous
                    </Button>
                    <span>Page {currentPage} of {data?.pagination.totalPages}</span>
                    <Button
                        onClick={() => setCurrentPage((prev) => (data?.pagination.totalPages && data.pagination.totalPages > 0 && prev < data.pagination.totalPages) ? prev + 1 : prev)}
                        disabled={data?.pagination.totalPages !== undefined && data.pagination.totalPages > 0 && currentPage >= data.pagination.totalPages}
                    >
                        Next
                    </Button>

                </div>
            </CardContent>
        </Card>
    );
};

export default Page;