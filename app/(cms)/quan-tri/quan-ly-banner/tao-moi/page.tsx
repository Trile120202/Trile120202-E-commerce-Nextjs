'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import SelectStatus from "@/components/custom/SelectStatus";
import { Status } from "@/lib/configs/enum.status";
import MediaPopup from "@/components/custom/MediaPopup";
import { ImagePlus } from "lucide-react";

interface Image {
    id: number;
    url: string;
    alt_text: string;
    created_at: string;
    updated_at: string;
    status: number;
}

const formSchema = z.object({
    name: z.string()
        .min(1, "Tên banner không được để trống")
        .max(100, "Tên banner không được vượt quá 100 ký tự"),
    location: z.string()
        .min(1, "Vị trí không được để trống"),
    position: z.string()
        .min(1, "Thứ tự không được để trống"),
    status: z.number().default(Status.ACTIVE)
});

const Page = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [openMediaPopup, setOpenMediaPopup] = useState(false);
    const [selectedImages, setSelectedImages] = useState<Image[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            location: "",
            position: "",
            status: Status.ACTIVE
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            const response = await fetch('/api/banner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    position: parseInt(values.position),
                    imageIds: selectedImages.map(img => img.id)
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể tạo banner mới');
            }

            router.push('/quan-tri/quan-ly-banner');
            router.refresh();
        } catch (error) {
            console.error('Lỗi khi tạo banner:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (images: Image[]) => {
        setSelectedImages(images);
    };

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl lg:text-3xl font-bold">Thêm banner mới</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Tên banner</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Nhập tên banner" 
                                                {...field}
                                                className="focus:ring-2 h-10 lg:h-12 text-base lg:text-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Vị trí</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="focus:ring-2 h-10 lg:h-12 text-base lg:text-lg">
                                                    <SelectValue placeholder="Chọn vị trí" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="home">Trang chủ</SelectItem>
                                                <SelectItem value="product">Trang sản phẩm</SelectItem>
                                                <SelectItem value="category">Trang danh mục</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Thứ tự</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number"
                                                placeholder="Nhập thứ tự" 
                                                {...field}
                                                className="focus:ring-2 h-10 lg:h-12 text-base lg:text-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Trạng thái</FormLabel>
                                        <FormControl>
                                            <SelectStatus
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                options="basic"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div>
                                <FormLabel className="text-base lg:text-lg">Hình ảnh</FormLabel>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                                    {selectedImages.map((image) => (
                                        <div key={image.id} className="relative group">
                                            <img
                                                src={image.url}
                                                alt={image.alt_text}
                                                className="w-full h-[200px] object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setSelectedImages(selectedImages.filter(img => img.id !== image.id))}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setOpenMediaPopup(true)}
                                        className="h-[200px] flex flex-col items-center justify-center gap-2"
                                    >
                                        <ImagePlus className="h-8 w-8" />
                                        <span>Thêm ảnh</span>
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 lg:gap-6 pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="w-[120px] lg:w-[140px] h-10 lg:h-12 text-base lg:text-lg"
                                >
                                    Hủy
                                </Button>
                                <Button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-[120px] lg:w-[140px] h-10 lg:h-12 text-base lg:text-lg"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2 lg:gap-3">
                                            <div className="h-4 w-4 lg:h-5 lg:w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                            <span>Đang xử lý</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 lg:gap-3">
                                            <Save className="h-4 w-4 lg:h-5 lg:w-5" />
                                            <span>Lưu</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <MediaPopup
                open={openMediaPopup}
                onOpenChange={setOpenMediaPopup}
                onSelect={(images) => handleImageSelect(images as Image[])}
                multiple={true}
            />
        </div>
    );
};

export default Page;
