"use client";

import React, { useEffect, useState } from "react";
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
import MediaPopup from "@/components/custom/MediaPopup";
import RoleSelect from "@/components/custom/RoleSelect";
import { StatusCode } from "@/lib/statusCodes";
import { Skeleton } from "@/components/ui/skeleton";

interface Role {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    status: number;
}

const formSchema = z.object({
    username: z.string()
        .min(1, "Tên đăng nhập không được để trống")
        .max(50, "Tên đăng nhập không được vượt quá 50 ký tự"),
    email: z.string()
        .min(1, "Email không được để trống")
        .email("Email không hợp lệ"),
    first_name: z.string()
        .min(1, "Tên không được để trống")
        .max(50, "Tên không được vượt quá 50 ký tự"),
    last_name: z.string()
        .min(1, "Họ không được để trống")
        .max(50, "Họ không được vượt quá 50 ký tự"),
    role_id: z.string().min(1, "Vai trò không được để trống"),
    status: z.boolean().default(true)
});

const PROTECTED_USER_IDS = ['bfece6d4-82d8-46b9-8326-c36b4bbc813d'];

const Page = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [showMediaPopup, setShowMediaPopup] = useState(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [currentAvatar, setCurrentAvatar] = useState<any>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            first_name: "",
            last_name: "",
            role_id: "",
            status: true
        },
    });

    useEffect(() => {
        if (PROTECTED_USER_IDS.includes(params.id)) {
            toast({
                variant: "destructive",
                title: "Không thể truy cập",
                description: "Bạn không có quyền truy cập người dùng này",
            });
            router.push('/quan-tri/quan-ly-nguoi-dung');
            return;
        }

        const fetchUser = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/users/${params.id}`);
                const data = await response.json();

                if (response.status === StatusCode.NOT_FOUND) {
                    throw new Error('Không tìm thấy người dùng');
                }

                if (!response.ok) {
                    throw new Error(data.message || 'Không thể tải thông tin người dùng');
                }

                setUser(data.data);
                if (data.data.avatar_url) {
                    const avatarData = {
                        id: data.data.avatar_id,
                        url: data.data.avatar_url
                    };
                    setSelectedImage(avatarData);
                    setCurrentAvatar(avatarData);
                }

                form.reset({
                    username: data.data.username,
                    email: data.data.email,
                    first_name: data.data.first_name,
                    last_name: data.data.last_name,
                    role_id: data.data.role_id?.toString() || "",
                    status: data.data.status === 1
                });
            } catch (error) {
                console.error('Error fetching user:', error);
                toast({
                    variant: "destructive",
                    title: "Lỗi",
                    description: (error as Error).message || "Có lỗi xảy ra, vui lòng thử lại sau",
                });
                router.push('/quan-tri/quan-ly-nguoi-dung');
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchUser();
        }
    }, [params.id, form, toast, router]);

    const handleImageSelect = (image: any) => {
        setSelectedImage(image);
        setShowMediaPopup(false);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);

            const avatarId = selectedImage?.id !== currentAvatar?.id ? selectedImage?.id : user.avatar_id;

            const response = await fetch(`/api/users/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    avatar_id: avatarId,
                    role_id: parseInt(values.role_id),
                    status: values.status ? 1 : 0
                }),
            });

            const data = await response.json();

            if (response.status === StatusCode.BAD_REQUEST) {
                if (data.message.includes('Username')) {
                    throw new Error('Tên đăng nhập đã tồn tại');
                }
                if (data.message.includes('Email')) {
                    throw new Error('Email đã tồn tại');
                }
                throw new Error(data.message);
            }

            if (!response.ok) {
                throw new Error(data.message || 'Không thể cập nhật người dùng');
            }

            toast({
                title: "Thành công",
                description: "Cập nhật người dùng thành công",
            });

            router.push('/quan-tri/quan-ly-nguoi-dung');
            router.refresh();

        } catch (error) {
            console.error('Error updating user:', error);
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
        <div className="p-6">
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Chỉnh sửa người dùng</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="flex justify-center mb-6">
                                <Skeleton className="w-32 h-32 rounded-full" />
                            </div>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                            <div className="flex justify-end gap-4 lg:gap-6 pt-6">
                                <Skeleton className="w-[120px] lg:w-[140px] h-10 lg:h-12" />
                                <Skeleton className="w-[120px] lg:w-[140px] h-10 lg:h-12" />
                            </div>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div 
                                            onClick={() => setShowMediaPopup(true)}
                                            className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden"
                                        >
                                            {selectedImage ? (
                                                <img 
                                                    src={selectedImage.url} 
                                                    alt="Avatar" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-gray-500">Chọn ảnh</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tên đăng nhập</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Nhập tên đăng nhập" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" placeholder="Nhập email" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tên</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Nhập tên" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="last_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Họ</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Nhập họ" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <RoleSelect
                                    control={form.control}
                                    name="role_id"
                                    label="Vai trò"
                                    placeholder="Chọn vai trò"
                                    className="h-10 lg:h-12 text-base lg:text-lg"
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
                    )}
                </CardContent>
            </Card>

            <MediaPopup
                open={showMediaPopup}
                onOpenChange={setShowMediaPopup}
                onSelect={handleImageSelect}
            />
        </div>
    );
};

export default Page;
