"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
    name: z.string()
        .min(1, "Tên RAM không được để trống")
        .max(100, "Tên RAM không được vượt quá 100 ký tự"),
    type: z.string()
        .min(1, "Loại RAM không được để trống")
        .max(50, "Loại RAM không được vượt quá 50 ký tự"),
    capacity: z.string()
        .min(1, "Dung lượng RAM không được để trống")
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Dung lượng RAM phải là số dương"),
    speed: z.string()
        .min(1, "Tốc độ RAM không được để trống")
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Tốc độ RAM phải là số dương"),
    brand: z.string()
        .min(1, "Hãng sản xuất không được để trống")
        .max(50, "Thương hiệu không được vượt quá 50 ký tự"),
    status: z.boolean().default(true)
});

const Page = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [ram, setRam] = useState<any>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "",
            capacity: "",
            speed: "",
            brand: "",
            status: true
        },
    });

    useEffect(() => {
        const fetchRam = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/ram/${params.id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Không thể tải thông tin RAM');
                }

                setRam(data.data);
                form.reset({
                    name: data.data.name,
                    type: data.data.type,
                    capacity: data.data.capacity.toString(),
                    speed: data.data.speed.toString(),
                    brand: data.data.brand,
                    status: data.data.status === 1
                });
            } catch (error) {
                console.error('Error fetching RAM:', error);
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
            fetchRam();
        }
    }, [params.id, form, toast]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/ram/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    capacity: parseInt(values.capacity),
                    speed: parseInt(values.speed),
                    status: values.status ? 1 : 0
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Không thể cập nhật RAM');
            }

            toast({
                title: "Thành công",
                description: "Cập nhật RAM thành công",
            });

            router.push('/quan-tri/ram');
            router.refresh();

        } catch (error) {
            console.error('Error updating RAM:', error);
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
                    <CardTitle className="text-2xl">Chỉnh sửa RAM</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tên RAM</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Nhập tên RAM" />
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
                                        <FormLabel>Loại RAM</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Nhập loại RAM" />
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
                                        <FormLabel>Dung lượng (GB)</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" placeholder="Nhập dung lượng RAM" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="speed"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tốc độ (MHz)</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" placeholder="Nhập tốc độ RAM" />
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
                                        <FormLabel>Thương hiệu</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Nhập thương hiệu" />
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
                                        <div className="flex items-center gap-2">
                                            <FormLabel>
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
