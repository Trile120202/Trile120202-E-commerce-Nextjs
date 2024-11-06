'use client';

import React, { useEffect, useState } from 'react';
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
import { useToast } from "@/hooks/use-toast";

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
        .min(1, "Giao diện không được để trống"),
    brand: z.string()
        .min(1, "Hãng sản xuất không được để trống")
        .max(50, "Thương hiệu không được vượt quá 50 ký tự"),
    status: z.boolean().default(true)
});

const Page = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [storage, setStorage] = useState<any>(null);

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

    useEffect(() => {
        const fetchStorage = async () => {
            try {
                const response = await fetch(`/api/storages/${params.id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Không thể tải thông tin ổ cứng');
                }

                setStorage(data.data);
                form.reset({
                    name: data.data.name,
                    type: data.data.type,
                    capacity: data.data.capacity.toString(),
                    interface: data.data.interface,
                    brand: data.data.brand,
                    status: data.data.status === 1
                });
            } catch (error) {
                console.error('Error fetching storage:', error);
                toast({
                    variant: "destructive",
                    title: "Lỗi",
                    description: (error as Error).message || "Có lỗi xảy ra, vui lòng thử lại sau",
                });
            }
        };

        if (params.id) {
            fetchStorage();
        }
    }, [params.id, form, toast]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/storages/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    capacity: parseInt(values.capacity),
                    status: values.status ? 1 : 0
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật ổ cứng');
            }

            toast({
                title: "Thành công",
                description: "Cập nhật ổ cứng thành công",
            });
            router.push('/quan-tri/quan-ly-o-cung');
            router.refresh();

        } catch (error) {
            console.error('Error updating storage:', error);
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
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl lg:text-3xl font-bold">Chỉnh sửa ổ cứng</CardTitle>
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
                                        <FormLabel className="text-base lg:text-lg">Giao diện</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Nhập giao diện" 
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
                                            <span>Cập nhật</span>
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
