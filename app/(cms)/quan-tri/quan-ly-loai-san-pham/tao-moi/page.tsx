'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(1, 'Vui lòng nhập tên loại sản phẩm'),
    slug: z.string().min(1, 'Vui lòng nhập slug'),
    content: z.string().optional(),
    image_id: z.string().optional(),
    status: z.boolean().default(true)
});

const Page = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            slug: '',
            content: '',
            image_id: '',
            status: true
        }
    });

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
            
            // Validate required fields
            if (!values.name || !values.slug) {
                throw new Error('Tên và slug là bắt buộc');
            }

            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: values.name.trim(),
                    slug: values.slug.trim(),
                    content: values.content?.trim() || '',
                    image_id: values.image_id || null, // Changed from empty string to null
                    status: values.status ? 1 : 0
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra khi tạo loại sản phẩm');
            }

            toast({
                title: "Thành công",
                description: data.message || "Tạo mới loại sản phẩm thành công",
            });
            router.push('/quan-tri/quan-ly-loai-san-pham');
            router.refresh();

        } catch (error) {
            console.error('Error creating category:', error);
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
                        Tạo mới loại sản phẩm
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 lg:p-8">
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
                                            <Textarea 
                                                placeholder="Nhập nội dung" 
                                                className="min-h-[160px] lg:min-h-[200px] focus:ring-2 text-base lg:text-lg" 
                                                {...field} 
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
                                            <Input 
                                                type="file" 
                                                {...field} 
                                                className="h-10 lg:h-12 text-base lg:text-lg file:mr-4 lg:file:mr-5 file:py-2 file:px-4 lg:file:px-6 file:rounded-full file:border-0 file:text-base lg:file:text-lg file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
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
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 lg:p-6 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base lg:text-lg">
                                                Trạng thái
                                            </FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="scale-110 lg:scale-125"
                                            />
                                        </FormControl>
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
                                            <span>Tạo mới</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Page;