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
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
    name: z.string()
        .min(1, "Tên ổ cứng không được để trống")
        .max(100, "Tên ổ cứng không được vượt quá 100 ký tự"),
    type: z.string()
        .min(1, "Loại ổ cứng không được để trống")
        .max(50, "Loại ổ cứng không được vượt quá 50 ký tự"),
    capacity: z.string()
        .min(1, "Dung lượng ổ cứng không được để trống")
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Dung lượng ổ cứng phải là số dương"),
    interface: z.string()
        .min(1, "Cổng không được để trống"),
    brand: z.string()
        .min(1, "Hãng sản xuất không được để trống")
        .max(50, "Thương hiệu không được vượt quá 50 ký tự"),
    status: z.boolean().default(true)
});

const Page = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "",
            capacity: "",
            interface: "",
            brand: "",
            status: true
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            const response = await fetch('/api/storages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    capacity: parseInt(values.capacity),
                    status: values.status ? 1 : 0
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể tạo ổ cứng mới');
            }

            router.push('/quan-tri/quan-ly-o-cung');
            router.refresh();
        } catch (error) {
            console.error('Lỗi khi tạo ổ cứng:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl lg:text-3xl font-bold">Thêm ổ cứng mới</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Tên ổ cứng</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Nhập tên ổ cứng" 
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
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Loại ổ cứng</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Nhập loại ổ cứng" 
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
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Dung lượng (GB)</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number"
                                                placeholder="Nhập dung lượng ổ cứng" 
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
                                name="interface"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Cổng kết nối</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Nhập cổng kết nối"
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
                                            <Input 
                                                placeholder="Nhập hãng sản xuất" 
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
