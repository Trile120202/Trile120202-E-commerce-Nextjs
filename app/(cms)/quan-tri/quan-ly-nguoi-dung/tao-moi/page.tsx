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
import MediaPopup from "@/components/custom/MediaPopup";

const formSchema = z.object({
    username: z.string()
        .min(1, "Tên đăng nhập không được để trống")
        .max(50, "Tên đăng nhập không được vượt quá 50 ký tự"),
    password: z.string()
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
        .max(50, "Mật khẩu không được vượt quá 50 ký tự"),
    email: z.string()
        .min(1, "Email không được để trống")
        .email("Email không hợp lệ"),
    first_name: z.string()
        .min(1, "Tên không được để trống")
        .max(50, "Tên không được vượt quá 50 ký tự"),
    last_name: z.string()
        .min(1, "Họ không được để trống")
        .max(50, "Họ không được vượt quá 50 ký tự"),
    phone: z.string()
        .min(1, "Số điện thoại không được để trống")
        .max(20, "Số điện thoại không được vượt quá 20 ký tự"),
    address: z.string()
        .min(1, "Địa chỉ không được để trống")
        .max(200, "Địa chỉ không được vượt quá 200 ký tự"),
    role_id: z.string().min(1, "Vai trò không được để trống"),
    status: z.boolean().default(true),
    avatar_id: z.number().optional()
});

interface Role {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    status: number;
}

const Page = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [showMediaPopup, setShowMediaPopup] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{id: number, url: string} | null>(null);

    React.useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch('/api/role/get-all-role');
                if (response.ok) {
                    const result = await response.json();
                    if (result.status === 200) {
                        setRoles(result.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };
        fetchRoles();
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
            email: "",
            first_name: "",
            last_name: "",
            phone: "",
            address: "",
            role_id: "",
            status: true,
            avatar_id: undefined
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    role_id: parseInt(values.role_id),
                    status: values.status ? 1 : 0,
                    avatar_id: selectedImage?.id
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể tạo người dùng mới');
            }

            router.push('/quan-tri/quan-ly-nguoi-dung');
            router.refresh();
        } catch (error) {
            console.error('Lỗi khi tạo người dùng:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (image: {id: number, url: string}) => {
        setSelectedImage(image);
        setShowMediaPopup(false);
    };

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl lg:text-3xl font-bold">Thêm người dùng mới</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="flex flex-col items-center gap-4 mb-6">
                                {selectedImage && (
                                    <div className="relative w-32 h-32 rounded-full overflow-hidden">
                                        <img 
                                            src={selectedImage.url} 
                                            alt="Avatar" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowMediaPopup(true)}
                                    className="w-[180px] lg:w-[200px] h-10 lg:h-12 text-base lg:text-lg"
                                >
                                    Chọn ảnh đại diện
                                </Button>
                            </div>

                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Tên đăng nhập</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Nhập tên đăng nhập" 
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
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Mật khẩu</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="password"
                                                placeholder="Nhập mật khẩu" 
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
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Email</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="email"
                                                placeholder="Nhập email" 
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
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Tên</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Nhập tên" 
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
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Họ</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Nhập họ" 
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
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Số điện thoại</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Nhập số điện thoại" 
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
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Địa chỉ</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Nhập địa chỉ" 
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
                                name="role_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base lg:text-lg">Vai trò</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-10 lg:h-12 text-base lg:text-lg">
                                                    <SelectValue placeholder="Chọn vai trò" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem key={role.id} value={role.id.toString()}>
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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

            <MediaPopup
                open={showMediaPopup}
                onOpenChange={setShowMediaPopup}
                onSelect={handleImageSelect}
            />
        </div>
    );
};

export default Page;