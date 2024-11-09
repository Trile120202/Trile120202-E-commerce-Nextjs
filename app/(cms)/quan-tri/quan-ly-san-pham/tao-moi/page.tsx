'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ImagePlus } from 'lucide-react';
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
import { Textarea } from "@/components/ui/textarea";
import SelectData from "@/components/custom/SelectData";
import SelectStatus from "@/components/custom/SelectStatus";
import { Status } from "@/lib/configs/enum.status";
import MediaPopup from "@/components/custom/MediaPopup";
import QuillComponent from "@/components/quill";


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
        .min(1, "Tên sản phẩm không được để trống")
        .max(255, "Tên sản phẩm không được vượt quá 255 ký tự"),
    price: z.string()
        .min(1, "Giá không được để trống"),
    stock_quantity: z.string()
        .min(1, "Số lượng tồn kho không được để trống"),
    description: z.string()
        .min(1, "Mô tả không được để trống"),
    specifications: z.string().optional(),
    categories: z.array(z.number())
        .min(1, "Phải chọn ít nhất một danh mục"),
    ram_ids: z.array(z.number())
        .min(1, "Phải chọn ít nhất một RAM"),
    storage_ids: z.array(z.number())
        .min(1, "Phải chọn ít nhất một ổ cứng"),
    tag_ids: z.array(z.number())
        .min(1, "Phải chọn ít nhất một tag"),
    status: z.number().default(Status.ACTIVE),
    thumbnail_id: z.number({
        required_error: "Vui lòng chọn ảnh đại diện"
    }),
    images: z.array(z.number())
        .min(1, "Phải chọn ít nhất một ảnh sản phẩm")
});

const Page = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [openThumbnailPopup, setOpenThumbnailPopup] = useState(false);
    const [openImagesPopup, setOpenImagesPopup] = useState(false);
    const [selectedThumbnail, setSelectedThumbnail] = useState<Image | null>(null);
    const [selectedImages, setSelectedImages] = useState<Image[]>([]);
    const [description, setDescription] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            price: "",
            stock_quantity: "",
            description: "",
            specifications: "",
            categories: [],
            ram_ids: [],
            storage_ids: [],
            tag_ids: [],
            status: Status.ACTIVE,
            thumbnail_id: 0,
            images: []
        },
    });

    useEffect(() => {
        form.setValue('description', description);
    }, [description, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    price: parseFloat(values.price),
                    stock_quantity: parseInt(values.stock_quantity),
                    specifications: values.specifications ? JSON.parse(values.specifications) : null
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể tạo sản phẩm mới');
            }

            router.push('/quan-tri/quan-ly-san-pham');
            router.refresh();
        } catch (error) {
            console.error('Lỗi khi tạo sản phẩm:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleThumbnailSelect = (image: Image) => {
        setSelectedThumbnail(image);
        form.setValue('thumbnail_id', image.id);
    };

    const handleImagesSelect = (images: Image[]) => {
        setSelectedImages(images);
        form.setValue('images', images.map(img => img.id));
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="sticky top-0 z-20 bg-white shadow">
                <Card className="rounded-none border-0">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="container mx-auto px-4 py-6">
                            <CardTitle className="text-2xl md:text-3xl font-bold">Thêm sản phẩm mới</CardTitle>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <div className="flex-1 container mx-auto px-4 py-8">
                <Card className="shadow-lg">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base lg:text-lg font-semibold">Tên sản phẩm</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="Nhập tên sản phẩm" 
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
                                        name="categories"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base lg:text-lg font-semibold">Danh mục</FormLabel>
                                                <FormControl>
                                                    <SelectData
                                                        endpoint="/api/categories/all-category"
                                                        multiple={true}
                                                        placeholder="Chọn danh mục"
                                                        onSelect={(value) => field.onChange(value)}
                                                        defaultValue={field.value}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="thumbnail_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base lg:text-lg font-semibold">Ảnh đại diện</FormLabel>
                                                <FormControl>
                                                    <div>
                                                        {selectedThumbnail ? (
                                                            <div className="relative group">
                                                                <img
                                                                    src={selectedThumbnail.url}
                                                                    alt={selectedThumbnail.alt_text}
                                                                    className="w-full h-[200px] object-cover rounded-lg"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedThumbnail(null);
                                                                        field.onChange(0);
                                                                    }}
                                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => setOpenThumbnailPopup(true)}
                                                                className="w-full h-[200px] flex flex-col items-center justify-center gap-2"
                                                            >
                                                                <ImagePlus className="h-8 w-8" />
                                                                <span>Chọn ảnh đại diện</span>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="images"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base lg:text-lg font-semibold">Ảnh sản phẩm</FormLabel>
                                                <FormControl>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                        {selectedImages.map((image) => (
                                                            <div key={image.id} className="relative group">
                                                                <img
                                                                    src={image.url}
                                                                    alt={image.alt_text}
                                                                    className="w-full h-[100px] object-cover rounded-lg"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newImages = selectedImages.filter(img => img.id !== image.id);
                                                                        setSelectedImages(newImages);
                                                                        field.onChange(newImages.map(img => img.id));
                                                                    }}
                                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setOpenImagesPopup(true)}
                                                            className="h-[100px] flex flex-col items-center justify-center gap-2"
                                                        >
                                                            <ImagePlus className="h-8 w-8" />
                                                            <span>Thêm ảnh</span>
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base lg:text-lg font-semibold">Giá</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number"
                                                        placeholder="Nhập giá" 
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
                                        name="stock_quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base lg:text-lg font-semibold">Số lượng tồn kho</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number"
                                                        placeholder="Nhập số lượng" 
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
                                                <FormLabel className="text-base lg:text-lg font-semibold">Trạng thái</FormLabel>
                                                <FormControl>
                                                    <SelectStatus
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        options="basic"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="ram_ids"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg font-semibold">RAM</FormLabel>
                                            <FormControl>
                                                <SelectData
                                                    endpoint="/api/ram/get-ram-date-id-name"
                                                    multiple={true}
                                                    placeholder="Chọn RAM"
                                                    onSelect={(value) => field.onChange(value)}
                                                    defaultValue={field.value}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="storage_ids"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg font-semibold">Ổ cứng</FormLabel>
                                            <FormControl>
                                                <SelectData
                                                    endpoint="/api/storages/get-storage-data-id-name"
                                                    multiple={true}
                                                    placeholder="Chọn ổ cứng"
                                                    onSelect={(value) => field.onChange(value)}
                                                    defaultValue={field.value}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tag_ids"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg font-semibold">Tags</FormLabel>
                                            <FormControl>
                                                <SelectData
                                                    endpoint="/api/tag/get-tag-id-name"
                                                    multiple={true}
                                                    placeholder="Chọn tags"
                                                    onSelect={(value) => field.onChange(value)}
                                                    defaultValue={field.value}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg font-semibold">Mô tả</FormLabel>
                                            <FormControl>
                                                <QuillComponent
                                                    value={description}
                                                    onChangeValue={setDescription}
                                                    placeholder="Nhập mô tả sản phẩm"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="specifications"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg font-semibold">Thông số kỹ thuật (JSON)</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Nhập thông số kỹ thuật dạng JSON (không bắt buộc)" 
                                                    {...field}
                                                    className="focus:ring-2 min-h-[100px] text-base lg:text-lg"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
                                        className="w-[120px] lg:w-[140px] h-10 lg:h-12 text-base lg:text-lg bg-blue-600 hover:bg-blue-700"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2 lg:gap-3">
                                                <div className="h-4 w-4 lg:h-5 lg:w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
            </div>

            <MediaPopup
                open={openThumbnailPopup}
                onOpenChange={setOpenThumbnailPopup}
                onSelect={(image) => handleThumbnailSelect(image as Image)}
                multiple={false}
            />

            <MediaPopup
                open={openImagesPopup}
                onOpenChange={setOpenImagesPopup}
                onSelect={(images) => handleImagesSelect(images as Image[])}
                multiple={true}
            />
        </div>
    );
};

export default Page;
