'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import config from '@/lib/configs/config.json';
import { useToast } from "@/hooks/use-toast";

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

const formSchema = z.object({
    name: z.string()
        .min(1, "Tên card màn hình không được để trống")
        .max(100, "Tên card màn hình không được vượt quá 100 ký tự"),
    brand: z.string()
        .min(1, "Hãng sản xuất không được để trống")
        .max(50, "Hãng sản xuất không được vượt quá 50 ký tự"),
    memory_size: z.string()
        .min(1, "Dung lượng bộ nhớ không được để trống"),
    memory_type: z.string()
        .min(1, "Loại bộ nhớ không được để trống"),
    clock_speed: z.string()
        .min(1, "Xung nhịp không được để trống"),
    status: z.string().min(1, "Trạng thái không được để trống")
});

const Page = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            brand: "",
            memory_size: "",
            memory_type: "",
            clock_speed: "",
            status: "1"
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            const processedData = {
                ...values,
                status: parseInt(values.status)
            };

            const response = await fetch('/api/graphics_cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(processedData),
            });

            const result = await response.json();

            if (!response.ok) {
                toast({
                    variant: "destructive",
                    title: "Lỗi",
                    description: result.message || 'Không thể tạo card màn hình mới'
                });
                return;
            }

            toast({
                title: "Thành công",
                description: result.message
            });

            router.push('/quan-tri/quan-ly-card-man-hinh');
            router.refresh();
        } catch (error) {
            console.error('Lỗi khi tạo card màn hình:', error);
            toast({
                variant: "destructive", 
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi tạo card màn hình mới"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl lg:text-3xl font-bold">Thêm card màn hình mới</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg">Tên card màn hình</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Nhập tên card màn hình" 
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
                                    name="brand"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg">Hãng sản xuất</FormLabel>
                                            <FormControl>
                                                <select
                                                    {...field}
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-base lg:text-lg ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10 lg:h-12"
                                                >
                                                    <option value="">Chọn hãng sản xuất</option>
                                                    {config.graphics_cards.brand.map((brand) => (
                                                        <option key={brand} value={brand}>{brand}</option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="memory_size"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg">Dung lượng bộ nhớ</FormLabel>
                                            <FormControl>
                                                <select
                                                    {...field}
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-base lg:text-lg ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10 lg:h-12"
                                                >
                                                    <option value="">Chọn dung lượng bộ nhớ</option>
                                                    {config.graphics_cards.memory_size.map((size) => (
                                                        <option key={size} value={size}>{size}</option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="memory_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg">Loại bộ nhớ</FormLabel>
                                            <FormControl>
                                                <select
                                                    {...field}
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-base lg:text-lg ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10 lg:h-12"
                                                >
                                                    <option value="">Chọn loại bộ nhớ</option>
                                                    {config.graphics_cards.memory_type.map((type) => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="clock_speed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg">Xung nhịp</FormLabel>
                                            <FormControl>
                                                <select
                                                    {...field}
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-base lg:text-lg ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10 lg:h-12"
                                                >
                                                    <option value="">Chọn xung nhịp</option>
                                                    {config.graphics_cards.clock_speed.map((speed) => (
                                                        <option key={speed} value={speed}>{speed}</option>
                                                    ))}
                                                </select>
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-10 lg:h-12 text-base lg:text-lg">
                                                        <SelectValue placeholder="Chọn trạng thái" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">Hoạt động</SelectItem>
                                                    <SelectItem value="0">Không hoạt động</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
        </div>
    );
};

export default Page;