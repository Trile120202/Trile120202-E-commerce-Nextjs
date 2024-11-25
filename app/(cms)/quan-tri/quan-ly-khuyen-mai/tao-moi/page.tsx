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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
    code: z.string()
        .min(1, "Mã khuyến mãi không được để trống")
        .max(50, "Mã khuyến mãi không được vượt quá 50 ký tự"),
    discount_type: z.enum(['percentage', 'fixed_amount']),
    discount_value: z.string()
        .min(1, "Giá trị giảm không được để trống")
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Giá trị giảm phải là số dương"),
    start_date: z.string()
        .min(1, "Ngày bắt đầu không được để trống"),
    end_date: z.string()
        .min(1, "Ngày kết thúc không được để trống")
        .refine((end_date, ctx) => {
            const start = new Date(ctx.parent.start_date);
            const end = new Date(end_date);
            return end > start;
        }, "Ngày kết thúc phải sau ngày bắt đầu"),
    min_purchase_amount: z.string()
        .min(1, "Giá trị đơn hàng tối thiểu không được để trống")
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Giá trị đơn hàng tối thiểu phải là số dương"),
    max_usage: z.string().default('1')  ,
    max_discount_value: z.string()
        .min(1, "Giá trị giảm tối đa không được để trống")
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Giá trị giảm tối đa phải là số dương"),
    is_active: z.boolean().default(true)
});

const Page = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
            discount_type: "percentage",
            discount_value: "",
            start_date: "",
            end_date: "",
            min_purchase_amount: "",
            max_usage: "",
            max_discount_value: "",
            is_active: true
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            const processedData = {
                ...values,
                discount_value: Number(values.discount_value),
                min_purchase_amount: Number(values.min_purchase_amount),
                max_usage: Number(values.max_usage??1),
                max_discount_value: Number(values.max_discount_value),
                start_date: values.start_date + " 00:00:00",
                end_date: values.end_date + " 00:00:00"
            };

            const response = await fetch('/api/coupons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(processedData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể tạo khuyến mãi mới');
            }

            router.push('/quan-tri/quan-ly-khuyen-mai');
            router.refresh();
        } catch (error) {
            console.error('Lỗi khi tạo khuyến mãi:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl lg:text-3xl font-bold">Thêm khuyến mãi mới</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg">Mã khuyến mãi</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Nhập mã khuyến mãi" 
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
                                    name="discount_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg">Loại giảm giá</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn loại giảm giá" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="percentage">Phần trăm</SelectItem>
                                                    <SelectItem value="fixed_amount">Số tiền cố định</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="discount_value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg">Giá trị giảm</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number"
                                                    placeholder={form.watch('discount_type') === 'percentage' ? 'Nhập phần trăm giảm' : 'Nhập số tiền giảm'}
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
                                    name="max_discount_value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg">Giảm tối đa</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number"
                                                    placeholder="Nhập giá trị giảm tối đa"
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
                                    name="start_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg">Ngày bắt đầu</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="date"
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
                                    name="end_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg">Ngày kết thúc</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="date"
                                                    min={form.watch('start_date')}
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
                                    name="min_purchase_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg">Giá trị đơn hàng tối thiểu</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number"
                                                    placeholder="Nhập giá trị đơn hàng tối thiểu"
                                                    {...field}
                                                    className="focus:ring-2 h-10 lg:h-12 text-base lg:text-lg"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* <FormField
                                    control={form.control}
                                    name="max_usage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base lg:text-lg">Số lần sử dụng tối đa</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number"
                                                    placeholder="Nhập số lần sử dụng tối đa"
                                                    {...field}
                                                    className="focus:ring-2 h-10 lg:h-12 text-base lg:text-lg"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /> */}

                                {/* <FormField
                                    control={form.control}
                                    name="is_active"
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
                                /> */}
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