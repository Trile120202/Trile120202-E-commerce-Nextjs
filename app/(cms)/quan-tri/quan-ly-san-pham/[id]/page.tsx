'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, ImagePlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
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
        .refine((val) => parseInt(val) >= 1000, "Giá phải từ 1.000đ trở lên"),
    stock_quantity: z.string()
        .trim()
        .min(1, "Số lượng tồn kho không được để trống")
        .refine((val) => parseInt(val) >= 0, "Số lượng tồn kho phải từ 0 trở lên"),
    description: z.string()
        .trim()
        .min(1, "Mô tả không được để trống"),
    specifications: z.string().trim().optional(),
    categories: z.array(z.string())
        .min(1, "Phải chọn một danh mục"),
    ram_ids: z.array(z.string())
        .min(1, "Phải chọn ít nhất một RAM"),
    storage_ids: z.array(z.string())
        .min(1, "Phải chọn ít nhất một ổ cứng"),
    tag_ids: z.array(z.string())
        .min(1, "Phải chọn ít nhất một tag"),
    display_ids: z.array(z.string())
        .min(1, "Phải chọn ít nhất một màn hình"),
    cpu_ids: z.array(z.string())
        .min(1, "Phải chọn ít nhất một CPU"),
    graphics_card_ids: z.array(z.string())
        .min(1, "Phải chọn ít nhất một card đồ họa"),
    status: z.number().default(1),
    thumbnail_id: z.string({
        required_error: "Vui lòng chọn ảnh đại diện"
    }),
    images: z.array(z.string())
        .min(1, "Phải chọn ít nhất một ảnh sản phẩm")
});

const Page = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [openThumbnailPopup, setOpenThumbnailPopup] = useState(false);
    const [openImagesPopup, setOpenImagesPopup] = useState(false);
    const [selectedThumbnail, setSelectedThumbnail] = useState<Image | null>(null);
    const [selectedImages, setSelectedImages] = useState<Image[]>([]);
    const [description, setDescription] = useState("");
    const [product, setProduct] = useState<any>(null);

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
            display_ids: [],
            cpu_ids: [],
            graphics_card_ids: [],
            status: 1,
            thumbnail_id: "",
            images: []
        }
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/products/${params.id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Không thể tải thông tin sản phẩm');
                }

                const productData = data.data;
                console.log("Product Data:", productData);

                const thumbnail = {
                    id: productData.thumbnail_id,
                    url: productData.thumbnail_url,
                    alt_text: productData.thumbnail_alt_text,
                    created_at: "",
                    updated_at: "",
                    status: 1
                };

                const images = productData.product_image_ids.map((id: string, index: number) => ({
                    id: id,
                    url: productData.product_image_urls[index],
                    alt_text: "",
                    created_at: "",
                    updated_at: "",
                    status: 1
                }));

                setProduct(productData);
                setSelectedThumbnail(thumbnail);
                setSelectedImages(images);
                setDescription(productData.description);

                const parseIds = (value: string | number[] | null | undefined) => {
                    if (!value) return [];
                    if (Array.isArray(value)) return value.map(String);
                    if (typeof value === 'string' && value.trim() !== '') {
                        return value.split(',').map(id => id.trim());
                    }
                    return [];
                };

                const categoryIds = parseIds(productData.category_ids);
                const ramIds = parseIds(productData.ram_ids);
                const storageIds = parseIds(productData.storage_ids);
                const tagIds = parseIds(productData.tag_ids);
                const displayIds = parseIds(productData.display_ids);
                const cpuIds = parseIds(productData.cpu_ids);
                const graphicsCardIds = parseIds(productData.graphics_card_ids);

                console.log("CPU IDs:", cpuIds);
                console.log("Display IDs:", displayIds);

                form.reset({
                    name: productData.product_name || "",
                    price: productData.price?.toString() || "",
                    stock_quantity: productData.stock_quantity?.toString() || "",
                    description: productData.description || "",
                    specifications: productData.specifications || "",
                    categories: categoryIds,
                    ram_ids: ramIds,
                    storage_ids: storageIds,
                    tag_ids: tagIds,
                    display_ids: displayIds,
                    cpu_ids: cpuIds,
                    graphics_card_ids: graphicsCardIds,
                    status: productData.product_status,
                    thumbnail_id: productData.thumbnail_id?.toString() || "",
                    images: productData.product_image_ids?.map(String) || []
                });
            } catch (error) {
                console.error('Error fetching product:', error);
                toast({
                    variant: "destructive", 
                    title: "Lỗi",
                    description: (error as Error).message || "Có lỗi xảy ra, vui lòng thử lại sau",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchProduct();
        }
    }, [params.id, form, toast]);

    const handleThumbnailSelect = (image: Image) => {
        setSelectedThumbnail(image);
        form.setValue("thumbnail_id", image.id);
    };

    const handleImagesSelect = (images: Image[]) => {
        setSelectedImages(images);
        form.setValue("images", images.map(img => img.id));
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);

            let parsedSpecifications = null;
            if (values.specifications) {
                try {
                    parsedSpecifications = JSON.parse(values.specifications);
                } catch (e) {
                    toast({
                        variant: "destructive",
                        title: "Lỗi",
                        description: "Thông số kỹ thuật phải là JSON hợp lệ",
                    });
                    return;
                }
            }

            const response = await fetch(`/api/products/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    price: parseFloat(values.price),
                    stock_quantity: parseInt(values.stock_quantity),
                    specifications: parsedSpecifications,
                    description
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Không thể cập nhật sản phẩm');
            }

            toast({
                title: "Thành công",
                description: "Cập nhật sản phẩm thành công",
            });

            router.push('/quan-tri/quan-ly-san-pham');
            router.refresh();
        } catch (error) {
            console.error('Error updating product:', error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: (error as Error).message || "Có lỗi xảy ra, vui lòng thử lại sau",
            });
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <Card>
                    <CardHeader className="space-y-1">
                        <Skeleton className="h-8 w-1/4" />
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2.5">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                        <div className="flex justify-end gap-4 lg:gap-6 pt-6">
                            <Skeleton className="w-[120px] lg:w-[140px] h-10 lg:h-12" />
                            <Skeleton className="w-[120px] lg:w-[140px] h-10 lg:h-12" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6">
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Chỉnh sửa sản phẩm</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg">Tên sản phẩm</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Nhập tên sản phẩm" 
                                                    {...field}
                                                    className="h-10 lg:h-12 text-base lg:text-lg"
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
                                            <FormLabel className="text-base lg:text-lg">Danh mục</FormLabel>
                                            <FormControl>
                                                <SelectData
                                                    endpoint="/api/categories/all-category"
                                                    multiple={false}
                                                    placeholder="Chọn danh mục"
                                                    onSelect={(value) => field.onChange([value])}
                                                    defaultValue={field.value[0]}
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
                                            <FormLabel className="text-base lg:text-lg">Ảnh đại diện</FormLabel>
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
                                                                    field.onChange("");
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
                                            <FormLabel className="text-base lg:text-lg">Ảnh sản phẩm</FormLabel>
                                            <FormControl>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                    {selectedImages && selectedImages.map((image) => (
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
                                            <FormLabel className="text-base lg:text-lg">Giá</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number"
                                                    placeholder="Nhập giá" 
                                                    {...field}
                                                    className="h-10 lg:h-12 text-base lg:text-lg"
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
                                            <FormLabel className="text-base lg:text-lg">Số lượng tồn kho</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number"
                                                    placeholder="Nhập số lượng" 
                                                    {...field}
                                                    className="h-10 lg:h-12 text-base lg:text-lg"
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
                                                <select
                                                    value={field.value}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    className="w-full h-10 lg:h-12 text-base lg:text-lg border rounded-md px-3"
                                                >
                                                    <option value={1}>Kinh doanh</option>
                                                    <option value={0}>Ngưng kinh doanh</option>
                                                </select>
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
                                                multiple={false}
                                                placeholder="Chọn RAM"
                                                onSelect={(value) => field.onChange([value])}
                                                defaultValue={field.value[0]}
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
                                name="display_ids"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg font-semibold">Màn hình</FormLabel>
                                        <FormControl>
                                            <SelectData
                                                endpoint="/api/displays/get-display-id-name"
                                                multiple={true}
                                                placeholder="Chọn màn hình"
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
                                name="cpu_ids"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg font-semibold">CPU</FormLabel>
                                        <FormControl>
                                            <SelectData
                                                endpoint="/api/cpus/get-cpu-id-name"
                                                multiple={true}
                                                placeholder="Chọn CPU"
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
                                name="graphics_card_ids"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg font-semibold">Card đồ họa</FormLabel>
                                        <FormControl>
                                            <SelectData
                                                endpoint="/api/graphics_cards/get-graphics-card-id-name"
                                                multiple={true}
                                                placeholder="Chọn card đồ họa"
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
                                        <FormLabel className="text-base lg:text-lg">Mô tả</FormLabel>
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
                                        <FormLabel className="text-base lg:text-lg">Thông số kỹ thuật (JSON)</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Nhập thông số kỹ thuật dạng JSON (không bắt buộc)" 
                                                {...field}
                                                className="min-h-[100px] text-base lg:text-lg"
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
                                            <span>Cập nhật</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

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
