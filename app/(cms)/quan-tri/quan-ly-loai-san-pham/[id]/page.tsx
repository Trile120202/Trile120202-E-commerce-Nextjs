'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ImageIcon, Save } from "lucide-react";
import QuillComponent from "@/components/quill";
import { cn } from "@/lib/utils";
import MediaPopup from "@/components/custom/MediaPopup";
import { Skeleton } from "@/components/ui/skeleton";
import SelectStatus from "@/components/custom/SelectStatus";
import { Status } from "@/lib/configs/enum.status";

const formSchema = z.object({
    name: z.string().min(1, 'Vui lòng nhập tên loại sản phẩm'),
    slug: z.string().min(1, 'Vui lòng nhập slug'),
    content: z.string().optional(),
    image_id: z.string().optional(),
    status: z.number().default(Status.ACTIVE)
});

const Page = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [category, setCategory] = useState<any>(null);
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [urlImage, setUrlImage] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            slug: '',
            content: '',
            image_id: '',
            status: Status.ACTIVE
        }
    });

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await fetch(`/api/categories/${params.id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Không thể tải thông tin loại sản phẩm');
                }

                setCategory(data.data);
                setUrlImage(data.data.image?.url || null);
                form.reset({
                    name: data.data.name,
                    slug: data.data.slug,
                    content: data.data.content || '',
                    image_id: data.data.image_id?.toString() || '',
                    status: data.data.status
                });

                if (data.data.image_id) {
                    const imageResponse = await fetch(`/api/image/${data.data.image_id}`);
                    const imageData = await imageResponse.json();
                    
                    if (imageResponse.ok) {
                        setUrlImage(imageData.data.url);
                    }
                }
            } catch (error) {
                console.error('Error fetching category:', error);
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
            fetchCategory();
        }
    }, [params.id, form, toast]);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-');
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            
            if (!values.name || !values.slug) {
                throw new Error('Tên và slug là bắt buộc');
            }

            const response = await fetch(`/api/categories/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: params.id,
                    name: values.name.trim(),
                    slug: values.slug.trim(),
                    content: values.content?.trim() || '',
                    image_id: values.image_id || null,
                    status: values.status
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật loại sản phẩm');
            }

            toast({
                title: "Thành công",
                description: data.message || "Cập nhật loại sản phẩm thành công",
            });
            router.push('/quan-tri/quan-ly-loai-san-pham');
            router.refresh();

        } catch (error) {
            console.error('Error updating category:', error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: (error as Error).message || "Có lỗi xảy ra, vui lòng thử lại sau",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <MediaPopup 
                open={showImageDialog} 
                onOpenChange={setShowImageDialog}
                onSelect={(image: any) => {
                    form.setValue('image_id', image.id.toString())
                    setUrlImage(image.url)
                }}
                multiple={false}
            />

            <div className="container mx-auto py-8 px-4 lg:px-8 xl:px-12">
                <Card className="max-w-7xl mx-auto">
                    <CardHeader className="p-6 lg:p-8">
                        <CardTitle className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => router.back()}
                                className="h-8 w-8 lg:h-10 lg:w-10"
                            >
                                <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6" />
                            </Button>
                            Chỉnh sửa loại sản phẩm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 lg:p-8">
                        {isLoading ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-48 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-48 w-48" />
                                </div>
                                <Skeleton className="h-20 w-full" />
                                <div className="flex justify-end gap-4 lg:gap-6 pt-6">
                                    <Skeleton className="h-12 w-[140px]" />
                                    <Skeleton className="h-12 w-[140px]" />
                                </div>
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base lg:text-lg">Tên loại sản phẩm</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="Nhập tên loại sản phẩm" 
                                                            {...field} 
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                form.setValue('slug', generateSlug(e.target.value));
                                                            }}
                                                            className="focus:ring-2 h-10 lg:h-12 text-base lg:text-lg" 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="slug"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base lg:text-lg">Slug</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="Slug tự động tạo" 
                                                            {...field}
                                                            className="focus:ring-2 h-10 lg:h-12 text-base lg:text-lg" 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base lg:text-lg">Nội dung</FormLabel>
                                                <FormControl>
                                                    <QuillComponent 
                                                        className={cn('w-full')} 
                                                        title={'Mô tả'} 
                                                        onChangeValue={(value) => field.onChange(value)}
                                                        value={category?.content || ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="image_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base lg:text-lg">Hình ảnh</FormLabel>
                                                <FormControl>
                                                    <div className="space-y-4">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setShowImageDialog(true)}
                                                            className="w-full h-10 lg:h-12 text-base lg:text-lg flex items-center justify-center gap-2"
                                                        >
                                                            <ImageIcon className="h-5 w-5" />
                                                            <span>Chọn hình ảnh</span>
                                                        </Button>
                                                        {urlImage && (
                                                            <div className="relative w-[200px] h-[200px]">
                                                                <img 
                                                                    src={urlImage} 
                                                                    alt="Selected image"
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
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
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default Page;