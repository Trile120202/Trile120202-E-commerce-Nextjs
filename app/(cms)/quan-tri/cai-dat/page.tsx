'use client';

import React, {useEffect, useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FiSettings, FiLock, FiBell, FiEye, FiMail, FiPhone, FiMapPin, FiFacebook, FiInstagram, FiTwitter, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';
import useApi from "@/lib/useApi";
import { useToast } from "@/hooks/use-toast";

interface Setting {
    id: string;
    name: string;
    value: string;
    status: number;
    created_at: string;
    updated_at: string;
}

interface ApiResponse {
    status: number;
    message: string;
    data: Setting[];
}

const Page = () => {
    const [activeTab, setActiveTab] = useState("general");
    const { data, loading, error, fetchData } = useApi<ApiResponse>(
        `/api/settings`,
        {
            method: 'GET'
        }
    );
    const { toast } = useToast();
    const [settings, setSettings] = useState<{[key: string]: string}>({
        site_name: '',
        site_description: '',
        contact_email: '',
        contact_phone: '',
        contact_address: '',
        contact_time: '',
        contact_map_url: '',
        social_facebook: '',
        social_instagram: '',
        social_twitter: '',
        maintenance_mode: 'false',
        currency: '',
        security_login_attempts: '',
        security_lockout_duration: '',
        security_password_expiry: '',
        security_password_length: '',
        security_password_complexity: 'false',
        security_session_timeout: '',
        security_2fa_enabled: 'false',
        security_ip_whitelist: '',
        security_ssl_required: 'false',
        security_jwt_expiry: '',
        config: '{}',
        shipping_charge: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (data?.data) {
            const settingsObj: {[key: string]: string} = {};
            data.data.forEach(setting => {
                settingsObj[setting.name] = setting.value;
            });
            setSettings(prev => ({
                ...prev,
                ...settingsObj
            }));
        }
    }, [data]);

    const handleInputChange = (name: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSwitchChange = (name: string, checked: boolean) => {
        setSettings(prev => ({
            ...prev,
            [name]: checked.toString()
        }));
    };

    const handleSave = async () => {
        try {
            const settingsArray = Object.entries(settings).map(([name, value]) => ({
                name,
                value
            }));

            const response = await fetch('/api/settings/update-setting', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settingsArray)
            });

            const result = await response.json();

            if (response.ok) {
                toast({
                    description: 'Cài đặt đã được cập nhật thành công!',
                });
                fetchData();
            } else {
                toast({
                    variant: "destructive",
                    description: result.message || 'Có lỗi xảy ra khi cập nhật cài đặt',
                });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                variant: "destructive",
                description: 'Có lỗi xảy ra khi cập nhật cài đặt',
            });
        }
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
                        <TabsTrigger value="contact" className="flex items-center p-2 hover:bg-blue-100 transition-all duration-300">
                            <FiMail className="mr-2" /> Liên hệ
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center p-2 hover:bg-blue-100 transition-all duration-300">
                            <FiLock className="mr-2" /> Bảo mật
                        </TabsTrigger>
                        <TabsTrigger value="social" className="flex items-center p-2 hover:bg-blue-100 transition-all duration-300">
                            <FiFacebook className="mr-2" /> Mạng xã hội
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
                                    <Label htmlFor="site_name" className="text-lg text-gray-700">Tên trang web</Label>
                                    <Input 
                                        id="site_name"
                                        value={settings.site_name}
                                        onChange={(e) => handleInputChange('site_name', e.target.value)}
                                        placeholder="Nhập tên trang web" 
                                        className="mt-2 p-3" 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="site_description" className="text-lg text-gray-700">Mô tả trang web</Label>
                                    <Input 
                                        id="site_description"
                                        value={settings.site_description}
                                        onChange={(e) => handleInputChange('site_description', e.target.value)}
                                        placeholder="Nhập mô tả trang web" 
                                        className="mt-2 p-3" 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="currency" className="text-lg text-gray-700">Đơn vị tiền tệ</Label>
                                    <Input 
                                        id="currency"
                                        value={settings.currency}
                                        onChange={(e) => handleInputChange('currency', e.target.value)}
                                        placeholder="Nhập đơn vị tiền tệ" 
                                        className="mt-2 p-3" 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="shipping_charge" className="text-lg text-gray-700">Phí vận chuyển</Label>
                                    <Input 
                                        id="shipping_charge"
                                        value={settings.shipping_charge}
                                        onChange={(e) => handleInputChange('shipping_charge', e.target.value)}
                                        placeholder="Nhập phí vận chuyển"
                                        className="mt-2 p-3"
                                        type="number"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="config" className="text-lg text-gray-700">Cấu hình</Label>
                                    <Textarea
                                        id="config"
                                        value={settings.config}
                                        onChange={(e) => handleInputChange('config', e.target.value)}
                                        placeholder="Nhập cấu hình JSON"
                                        className="mt-2 p-3 min-h-[200px] font-mono"
                                    />
                                </div>
                                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                                    <Label htmlFor="maintenance_mode" className="text-lg text-gray-700">Chế độ bảo trì</Label>
                                    <Switch 
                                        id="maintenance_mode"
                                        checked={settings.maintenance_mode === 'true'}
                                        onCheckedChange={(checked) => handleSwitchChange('maintenance_mode', checked)}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="contact">
                            <h3 className="text-2xl font-semibold mb-6 text-gray-800">Thông tin liên hệ</h3>
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="contact_email" className="text-lg text-gray-700">Email liên hệ</Label>
                                    <Input 
                                        id="contact_email"
                                        value={settings.contact_email}
                                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                                        placeholder="Nhập email liên hệ" 
                                        className="mt-2 p-3" 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contact_phone" className="text-lg text-gray-700">Số điện thoại</Label>
                                    <Input 
                                        id="contact_phone"
                                        value={settings.contact_phone}
                                        onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                                        placeholder="Nhập số điện thoại" 
                                        className="mt-2 p-3" 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contact_address" className="text-lg text-gray-700">Địa chỉ</Label>
                                    <Input 
                                        id="contact_address"
                                        value={settings.contact_address}
                                        onChange={(e) => handleInputChange('contact_address', e.target.value)}
                                        placeholder="Nhập địa chỉ" 
                                        className="mt-2 p-3" 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contact_time" className="text-lg text-gray-700">Thời gian làm việc</Label>
                                    <Input 
                                        id="contact_time"
                                        value={settings.contact_time}
                                        onChange={(e) => handleInputChange('contact_time', e.target.value)}
                                        placeholder="Nhập thời gian làm việc" 
                                        className="mt-2 p-3" 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contact_map_url" className="text-lg text-gray-700">URL bản đồ</Label>
                                    <Input 
                                        id="contact_map_url"
                                        value={settings.contact_map_url}
                                        onChange={(e) => handleInputChange('contact_map_url', e.target.value)}
                                        placeholder="Nhập URL bản đồ" 
                                        className="mt-2 p-3" 
                                    />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="security">
                            <h3 className="text-2xl font-semibold mb-6 text-gray-800">Cài đặt bảo mật</h3>
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="security_login_attempts" className="text-lg text-gray-700">Số lần đăng nhập tối đa</Label>
                                    <Input 
                                        id="security_login_attempts"
                                        type="number"
                                        value={settings.security_login_attempts}
                                        onChange={(e) => handleInputChange('security_login_attempts', e.target.value)}
                                        placeholder="Nhập số lần" 
                                        className="mt-2 p-3" 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="security_lockout_duration" className="text-lg text-gray-700">Thời gian khóa (phút)</Label>
                                    <Input 
                                        id="security_lockout_duration"
                                        type="number"
                                        value={settings.security_lockout_duration}
                                        onChange={(e) => handleInputChange('security_lockout_duration', e.target.value)}
                                        placeholder="Nhập số phút" 
                                        className="mt-2 p-3" 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="security_password_expiry" className="text-lg text-gray-700">Thời gian hết hạn mật khẩu (ngày)</Label>
                                    <Input 
                                        id="security_password_expiry"
                                        type="number"
                                        value={settings.security_password_expiry}
                                        onChange={(e) => handleInputChange('security_password_expiry', e.target.value)}
                                        placeholder="Nhập số ngày" 
                                        className="mt-2 p-3" 
                                    />
                                </div>
                                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                                    <Label htmlFor="security_2fa_enabled" className="text-lg text-gray-700">Xác thực hai yếu tố</Label>
                                    <Switch 
                                        id="security_2fa_enabled"
                                        checked={settings.security_2fa_enabled === 'true'}
                                        onCheckedChange={(checked) => handleSwitchChange('security_2fa_enabled', checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                                    <Label htmlFor="security_ssl_required" className="text-lg text-gray-700">Yêu cầu SSL</Label>
                                    <Switch 
                                        id="security_ssl_required"
                                        checked={settings.security_ssl_required === 'true'}
                                        onCheckedChange={(checked) => handleSwitchChange('security_ssl_required', checked)}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="social">
                            <h3 className="text-2xl font-semibold mb-6 text-gray-800">Mạng xã hội</h3>
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="social_facebook" className="text-lg text-gray-700">Facebook</Label>
                                    <Input 
                                        id="social_facebook"
                                        value={settings.social_facebook}
                                        onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                                        placeholder="Nhập link Facebook" 
                                        className="mt-2 p-3" 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="social_instagram" className="text-lg text-gray-700">Instagram</Label>
                                    <Input 
                                        id="social_instagram"
                                        value={settings.social_instagram}
                                        onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                                        placeholder="Nhập link Instagram" 
                                        className="mt-2 p-3" 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="social_twitter" className="text-lg text-gray-700">Twitter</Label>
                                    <Input 
                                        id="social_twitter"
                                        value={settings.social_twitter}
                                        onChange={(e) => handleInputChange('social_twitter', e.target.value)}
                                        placeholder="Nhập link Twitter" 
                                        className="mt-2 p-3" 
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </motion.div>
                </Tabs>
                <div className="mt-8 text-right">
                    <Button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                    >
                        {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default Page;