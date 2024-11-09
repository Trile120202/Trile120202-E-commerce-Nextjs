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
    status: z.number().default(Status.ACTIVE),
    thumbnail_id: z.number({
        required_error: "Vui lòng chọn ảnh đại diện"
    }),
    images: z.array(z.number())
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
        resolver: zodResolver(formSchema)
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

                // Transform image data
                const thumbnail = {
                    id: productData.thumbnail_id,
                    url: productData.thumbnail_url,
                    alt_text: productData.thumbnail_alt_text,
                    created_at: "",
                    updated_at: "",
                    status: 1
                };

                const images = productData.product_image_ids.map((id: number, index: number) => ({
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

                // Parse categories string into array of IDs
                const categoryIds = productData.categories.split(',').map((cat: string) => parseInt(cat.trim()));

                form.reset({
                    name: productData.product_name,
                    price: productData.price.toString(),
                    stock_quantity: productData.stock_quantity.toString(),
                    description: productData.description,
                    specifications: productData.specifications || "",
                    categories: categoryIds,
                    status: productData.product_status,
                    thumbnail_id: productData.thumbnail_id,
                    images: productData.product_image_ids
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
            const response = await fetch(`/api/products/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    price: parseFloat(values.price),
                    stock_quantity: parseInt(values.stock_quantity),
                    specifications: values.specifications ? JSON.parse(values.specifications) : null,
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
                            </div>

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
