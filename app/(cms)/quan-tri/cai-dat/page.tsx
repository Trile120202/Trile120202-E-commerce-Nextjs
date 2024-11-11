'use client';

import React, {useEffect, useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FiSettings, FiLock, FiBell, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';
import useApi from "@/lib/useApi";

interface Setting {
    name: string;
    value: string | boolean;
}

interface Pagination {
    currentPage: number;
    pageSize: number;
    totalItems: string;
    totalPages: number;
}

interface ApiResponse {
    status: number;
    message: string;
    data: Setting[];
    pagination: Pagination;
}

const Page = () => {
    const [activeTab, setActiveTab] = useState("general");
    const { data, loading, error, fetchData } = useApi<ApiResponse>(
        `/api/settings`,
        {
            method: 'GET'
        }
    );

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = () => {
        console.log("Saving settings...");
    };

    const tabVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <Card className="w-full shadow-2xl bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6">
                <CardTitle className="text-3xl font-bold flex items-center">
                    <FiSettings className="mr-3" />
                    Cài đặt hệ thống
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <Tabs orientation="horizontal" value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
                    <TabsList className="flex justify-start space-x-4 mb-6 bg-gray-100 p-2 rounded-xl">
                        <TabsTrigger value="general" className="flex items-center p-2 hover:bg-blue-100 transition-all duration-300">
                            <FiSettings className="mr-2" /> Chung
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center p-2 hover:bg-blue-100 transition-all duration-300">
                            <FiLock className="mr-2" /> Bảo mật
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center p-2 hover:bg-blue-100 transition-all duration-300">
                            <FiBell className="mr-2" /> Thông báo
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="flex items-center p-2 hover:bg-blue-100 transition-all duration-300">
                            <FiEye className="mr-2" /> Giao diện
                        </TabsTrigger>
                    </TabsList>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={tabVariants}
                        key={activeTab}
                        className="bg-white p-6 rounded-xl shadow-md"
                    >
                        <TabsContent value="general">
                            <h3 className="text-2xl font-semibold mb-6 text-gray-800">Cài đặt chung</h3>
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="siteName" className="text-lg text-gray-700">Tên trang web</Label>
                                    <Input id="siteName" placeholder="Nhập tên trang web" className="mt-2 p-3" />
                                </div>
                                <div>
                                    <Label htmlFor="siteDescription" className="text-lg text-gray-700">Mô tả trang web</Label>
                                    <Input id="siteDescription" placeholder="Nhập mô tả trang web" className="mt-2 p-3" />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="security">
                            <h3 className="text-2xl font-semibold mb-6 text-gray-800">Cài đặt bảo mật</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                                    <Label htmlFor="twoFactor" className="text-lg text-gray-700">Xác thực hai yếu tố</Label>
                                    <Switch id="twoFactor" />
                                </div>
                                <div>
                                    <Label htmlFor="passwordExpiration" className="text-lg text-gray-700">Thời gian hết hạn mật khẩu (ngày)</Label>
                                    <Input id="passwordExpiration" type="number" placeholder="Nhập số ngày" className="mt-2 p-3" />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="notifications">
                            <h3 className="text-2xl font-semibold mb-6 text-gray-800">Cài đặt thông báo</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                                    <Label htmlFor="emailNotifications" className="text-lg text-gray-700">Thông báo qua email</Label>
                                    <Switch id="emailNotifications" />
                                </div>
                                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                                    <Label htmlFor="pushNotifications" className="text-lg text-gray-700">Thông báo đẩy</Label>
                                    <Switch id="pushNotifications" />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="appearance">
                            <h3 className="text-2xl font-semibold mb-6 text-gray-800">Cài đặt giao diện</h3>
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="theme" className="text-lg text-gray-700">Chủ đề</Label>
                                    <Input id="theme" placeholder="Chọn chủ đề" className="mt-2 p-3" />
                                </div>
                                <div>
                                    <Label htmlFor="fontSize" className="text-lg text-gray-700">Cỡ chữ mặc định</Label>
                                    <Input id="fontSize" type="number" placeholder="Nhập cỡ chữ" className="mt-2 p-3" />
                                </div>
                            </div>
                        </TabsContent>
                    </motion.div>
                </Tabs>
                <div className="mt-8 text-right">
                    <Button onClick={handleSave} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105">
                        Lưu cài đặt
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default Page;