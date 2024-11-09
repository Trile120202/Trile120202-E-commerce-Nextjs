'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Save, X } from "lucide-react";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import SelectStatus from "@/components/custom/SelectStatus";
import MediaPopup from "@/components/custom/MediaPopup";
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

const formSchema = z.object({
    name: z.string()
        .min(1, "Tên banner không được để trống")
        .max(100, "Tên banner không được vượt quá 100 ký tự"),
    location: z.string()
        .min(1, "Vị trí không được để trống"),
    position: z.string()
        .min(1, "Thứ tự không được để trống"),
    status: z.number().default(1)
});

const Page = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [banner, setBanner] = useState<any>(null);
    const [openMediaPopup, setOpenMediaPopup] = useState(false);
    const [selectedImages, setSelectedImages] = useState<Image[]>([]);
    const [imageToDelete, setImageToDelete] = useState<Image | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema)
    });

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/banner/${params.id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Không thể tải thông tin banner');
                }

                setBanner(data.data);
                setSelectedImages(data.data.images || []);
                form.reset({
                    name: data.data.name,
                    location: data.data.location,
                    position: data.data.position.toString(),
                    status: data.data.status
                });
            } catch (error) {
                console.error('Error fetching banner:', error);
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
            fetchBanner();
        }
    }, [params.id, form, toast]);

    const handleImageSelect = (images: Image[]) => {
        setSelectedImages(prev => [...prev, ...images]);
        setOpenMediaPopup(false);
    };

    const handleRemoveImage = (image: Image) => {
        setImageToDelete(image);
        setShowDeleteDialog(true);
    };

    const confirmRemoveImage = () => {
        if (imageToDelete) {
            setSelectedImages(prev => prev.filter(img => img.id !== imageToDelete.id));
            toast({
                title: "Thành công",
                description: "Xóa ảnh thành công",
            });
            setImageToDelete(null);
        }
        setShowDeleteDialog(false);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/banner/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    position: parseInt(values.position),
                    imageIds: selectedImages.map(img => img.id)
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Không thể cập nhật banner');
            }

            toast({
                title: "Thành công",
                description: "Cập nhật banner thành công",
            });

            router.push('/quan-tri/quan-ly-banner');
            router.refresh();

        } catch (error) {
            console.error('Error updating banner:', error);
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
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-2.5">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                        <div className="space-y-2.5">
                            <Skeleton className="h-4 w-[100px]" />
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-[200px] w-full" />
                                ))}
                            </div>
                        </div>
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
                    <CardTitle className="text-2xl">Chỉnh sửa banner</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
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
                                        <Select onValueChange={field.onChange} value={field.value}>
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
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleRemoveImage(image)}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
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
                open={openMediaPopup}
                onOpenChange={setOpenMediaPopup}
                onSelect={(images) => handleImageSelect(images as Image[])}
                multiple={true}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa ảnh</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa ảnh này khỏi banner không?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRemoveImage}>Xác nhận</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Page;
