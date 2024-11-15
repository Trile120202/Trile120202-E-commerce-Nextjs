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
    id: string;
    url: string;
    alt_text: string;
    created_at: string;
    updated_at: string;
    status: number;
}

const formSchema = z.object({
    name: z.string()
        .trim()
        .min(1, "Tên sản phẩm không được để trống")
        .max(255, "Tên sản phẩm không được vượt quá 255 ký tự"),
    price: z.string()
        .trim()
        .min(1, "Giá không được để trống")
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 1000, "Giá phải từ 1.000đ trở lên"),
    stock_quantity: z.string()
        .trim()
        .min(1, "Số lượng tồn kho không được để trống")
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 1, "Số lượng phải từ 1 trở lên"),
    description: z.string()
        .min(1, "Mô tả không được để trống"),
    specifications: z.string().optional(),
    categories: z.array(z.string())
        .min(1, "Phải chọn một danh mục"),
    ram_ids: z.array(z.string())
        .min(1, "Phải chọn ít nhất một RAM"),
    storage_ids: z.array(z.string())
        .min(1, "Phải chọn ít nhất một ổ cứng"),
    tag_ids: z.array(z.string())
        .min(1, "Phải chọn ít nhất một tag"),
    display_id: z.string()
        .min(1, "Phải chọn một màn hình"),
    cpu_id: z.string()
        .min(1, "Phải chọn một CPU"),
    graphics_card_ids: z.array(z.string())
        .min(1, "Phải chọn ít nhất một card đồ họa"),
    status: z.number().default(Status.ACTIVE),
    thumbnail_id: z.string({
        required_error: "Vui lòng chọn ảnh đại diện"
    }),
    images: z.array(z.string())
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
            display_id: "",
            cpu_id: "",
            graphics_card_ids: [],
            status: Status.ACTIVE,
            thumbnail_id: "",
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
                    name: values.name.trim(),
                    price: parseFloat(values.price.trim()),
                    stock_quantity: parseInt(values.stock_quantity.trim()),
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
        <div className="flex flex-col min-h-screen bg-gray-100">
            <div className="sticky top-0 z-20 bg-white shadow-md">
                <Card className="rounded-none border-0">
                    <CardHeader className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
                        <div className="container mx-auto px-6 py-8">
                            <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">Thêm sản phẩm mới</CardTitle>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <div className="flex-1 container mx-auto px-6 py-10">
                <Card className="shadow-xl rounded-xl border-0">
                    <CardContent className="p-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-lg font-semibold text-gray-800">Tên sản phẩm</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="Nhập tên sản phẩm" 
                                                        {...field}
                                                        className="h-12 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="categories"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-lg font-semibold text-gray-800">Danh mục</FormLabel>
                                                <FormControl>
                                                    <SelectData
                                                        endpoint="/api/categories/all-category"
                                                        multiple={true}
                                                        placeholder="Chọn danh mục"
                                                        onSelect={(value) => field.onChange(value)}
                                                        defaultValue={field.value}
                                                        className="rounded-lg"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <FormField
                                        control={form.control}
                                        name="thumbnail_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-lg font-semibold text-gray-800">Ảnh đại diện</FormLabel>
                                                <FormControl>
                                                    <div>
                                                        {selectedThumbnail ? (
                                                            <div className="relative group">
                                                                <img
                                                                    src={selectedThumbnail.url}
                                                                    alt={selectedThumbnail.alt_text}
                                                                    className="w-full h-[250px] object-cover rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedThumbnail(null);
                                                                        field.onChange("");
                                                                    }}
                                                                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => setOpenThumbnailPopup(true)}
                                                                className="w-full h-[250px] rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors duration-300 flex flex-col items-center justify-center gap-4"
                                                            >
                                                                <ImagePlus className="h-12 w-12 text-gray-400" />
                                                                <span className="text-lg text-gray-600">Chọn ảnh đại diện</span>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="images"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-lg font-semibold text-gray-800">Ảnh sản phẩm</FormLabel>
                                                <FormControl>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                        {selectedImages.map((image) => (
                                                            <div key={image.id} className="relative group">
                                                                <img
                                                                    src={image.url}
                                                                    alt={image.alt_text}
                                                                    className="w-full h-[120px] object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-[1.05]"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newImages = selectedImages.filter(img => img.id !== image.id);
                                                                        setSelectedImages(newImages);
                                                                        field.onChange(newImages.map(img => img.id));
                                                                    }}
                                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setOpenImagesPopup(true)}
                                                            className="h-[120px] rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors duration-300 flex flex-col items-center justify-center gap-2"
                                                        >
                                                            <ImagePlus className="h-8 w-8 text-gray-400" />
                                                            <span className="text-gray-600">Thêm ảnh</span>
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-lg font-semibold text-gray-800">Giá</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number"
                                                        min="1000"
                                                        placeholder="Nhập giá" 
                                                        {...field}
                                                        className="h-12 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="stock_quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-lg font-semibold text-gray-800">Số lượng tồn kho</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number"
                                                        min="1"
                                                        placeholder="Nhập số lượng" 
                                                        {...field}
                                                        className="h-12 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-lg font-semibold text-gray-800">Trạng thái</FormLabel>
                                                <FormControl>
                                                    <SelectStatus
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        options="basic"
                                                        className="rounded-lg"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="ram_ids"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold text-gray-800">RAM</FormLabel>
                                            <FormControl>
                                                <SelectData
                                                    endpoint="/api/ram/get-ram-date-id-name"
                                                    multiple={false}
                                                    placeholder="Chọn RAM"
                                                    onSelect={(value) => field.onChange([value])}
                                                    defaultValue={field.value[0]}
                                                    className="rounded-lg"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="storage_ids"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold text-gray-800">Ổ cứng</FormLabel>
                                            <FormControl>
                                                <SelectData
                                                    endpoint="/api/storages/get-storage-data-id-name"
                                                    multiple={true}
                                                    placeholder="Chọn ổ cứng"
                                                    onSelect={(value) => field.onChange(value)}
                                                    defaultValue={field.value}
                                                    className="rounded-lg"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tag_ids"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold text-gray-800">Tags</FormLabel>
                                            <FormControl>
                                                <SelectData
                                                    endpoint="/api/tag/get-tag-id-name"
                                                    multiple={true}
                                                    placeholder="Chọn tags"
                                                    onSelect={(value) => field.onChange(value)}
                                                    defaultValue={field.value}
                                                    className="rounded-lg"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="display_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold text-gray-800">Màn hình</FormLabel>
                                            <FormControl>
                                                <SelectData
                                                    endpoint="/api/displays/get-display-id-name"
                                                    multiple={false}
                                                    placeholder="Chọn màn hình"
                                                    onSelect={(value) => field.onChange(value)}
                                                    defaultValue={field.value}
                                                    className="rounded-lg"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cpu_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold text-gray-800">CPU</FormLabel>
                                            <FormControl>
                                                <SelectData
                                                    endpoint="/api/cpus/get-cpu-id-name"
                                                    multiple={false}
                                                    placeholder="Chọn CPU"
                                                    onSelect={(value) => field.onChange(value)}
                                                    defaultValue={field.value}
                                                    className="rounded-lg"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="graphics_card_ids"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold text-gray-800">Card đồ họa</FormLabel>
                                            <FormControl>
                                                <SelectData
                                                    endpoint="/api/graphics_cards/get-graphics-card-id-name"
                                                    multiple={true}
                                                    placeholder="Chọn card đồ họa"
                                                    onSelect={(value) => field.onChange(value)}
                                                    defaultValue={field.value}
                                                    className="rounded-lg"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold text-gray-800">Mô tả</FormLabel>
                                            <FormControl>
                                                <QuillComponent
                                                    value={description}
                                                    onChangeValue={setDescription}
                                                    placeholder="Nhập mô tả sản phẩm"
                                                    className="min-h-[200px] rounded-lg"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="specifications"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold text-gray-800">Thông số kỹ thuật (JSON)</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Nhập thông số kỹ thuật dạng JSON (không bắt buộc)" 
                                                    {...field}
                                                    className="min-h-[150px] text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end gap-6 pt-8">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="w-[160px] h-12 text-lg font-medium rounded-lg hover:bg-gray-100"
                                    >
                                        Hủy
                                    </Button>
                                    <Button 
                                        type="submit"
                                        disabled={loading}
                                        className="w-[160px] h-12 text-lg font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-3">
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                <span>Đang xử lý</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Save className="h-5 w-5" />
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
