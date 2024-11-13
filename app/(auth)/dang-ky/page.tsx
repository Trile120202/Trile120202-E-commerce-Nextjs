'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FiUser, FiLock, FiMail, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const Page = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        full_name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Có lỗi xảy ra khi đăng ký');
            }

            router.push('/dang-nhap');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi đăng ký');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md shadow-2xl bg-white/80 backdrop-blur-md">
                    <CardHeader className="space-y-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-lg">
                        <CardTitle className="text-3xl font-bold text-center">Đăng ký</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name" className="text-gray-700 font-medium">Họ và tên</Label>
                                <div className="relative">
                                    <FiUserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="full_name"
                                        type="text"
                                        placeholder="Nguyễn Văn A"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className="pl-10 border-2 border-gray-300 focus:border-blue-500 transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-gray-700 font-medium">Tên đăng nhập</Label>
                                <div className="relative">
                                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="pl-10 border-2 border-gray-300 focus:border-blue-500 transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                                <div className="relative">
                                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-10 border-2 border-gray-300 focus:border-blue-500 transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700 font-medium">Mật khẩu</Label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pl-10 pr-10 border-2 border-gray-300 focus:border-blue-500 transition-all duration-300"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng ký'}
                            </Button>
                        </form>
                        <div className="mt-6 text-center text-sm">
                            Đã có tài khoản?{' '}
                            <Link href="/dang-nhap" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300">
                                Đăng nhập ngay
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default Page;