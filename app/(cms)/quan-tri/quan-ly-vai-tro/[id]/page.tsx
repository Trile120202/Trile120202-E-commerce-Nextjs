'use client';

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
        .min(1, "Tên vai trò không được để trống")
        .max(100, "Tên vai trò không được vượt quá 100 ký tự"),
    description: z.string()
        .min(1, "Mô tả không được để trống")
        .max(500, "Mô tả không được vượt quá 500 ký tự"),
    status: z.boolean().default(true)
});

const PROTECTED_ROLE_IDS = [
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001'
];

const Page = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [role, setRole] = useState<any>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            status: true
        },
    });

    useEffect(() => {
        const fetchRole = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/role/${params.id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Không thể tải thông tin vai trò');
                }

                if (PROTECTED_ROLE_IDS.includes(params.id)) {
                    toast({
                        variant: "destructive",
                        title: "Không thể sửa vai trò bảo mật",
                        description: "Vai trò bảo mật không thể sửa được",
                    });
                    router.back();
                    return;
                }

                setRole(data.data);
                form.reset({
                    name: data.data.name,
                    description: data.data.description,
                    status: data.data.status === 1
                });
            } catch (error) {
                console.error('Error fetching role:', error);
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
            fetchRole();
        }
    }, [params.id, form, toast, router]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (PROTECTED_ROLE_IDS.includes(params.id)) {
            toast({
                variant: "destructive", 
                title: "Không thể sửa vai trò bảo mật",
                description: "Vai trò bảo mật không thể sửa được",
            });
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/role/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    status: values.status ? 1 : 0
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Không thể cập nhật vai trò');
            }

            toast({
                title: "Thành công",
                description: "Cập nhật vai trò thành công",
            });

            router.push('/quan-tri/quan-ly-vai-tro');
            router.refresh();

        } catch (error) {
            console.error('Error updating role:', error);
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
                        <Skeleton className="h-8 w-[200px]" />
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-6 w-[60px]" />
                        </div>
                        <div className="flex justify-end gap-4 lg:gap-6 pt-6">
                            <Skeleton className="h-12 w-[140px]" />
                            <Skeleton className="h-12 w-[140px]" />
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
                    <CardTitle className="text-2xl">Chỉnh sửa vai trò</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tên vai trò</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Nhập tên vai trò" />
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
                                        <FormLabel>Mô tả</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Nhập mô tả" />
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
