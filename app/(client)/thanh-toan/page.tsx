"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaMapMarkerAlt, FaTag, FaCreditCard, FaTrash, FaPlus } from 'react-icons/fa';
import { useCart } from '@/hooks/useCart';
import useSWR from 'swr';

interface Location {
    id: number;
    user_id: number;
    province_code: string;
    district_code: string;
    ward_code: string;
    postal_code: string;
    phone_number: string;
    is_default: boolean;
    status: number;
    created_at: string;
    updated_at: string;
}

interface LocationResponse {
    status: number;
    message: string;
    data: Location[];
}

interface Province {
    code: string;
    name: string;
    id: number;
}

interface District {
    province_code: string;
    name: string;
    id: number;
}

interface Ward {
    district_code: string;
    name: string;
    id: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const Page = () => {
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newLocation, setNewLocation] = useState({
        province_code: '',
        district_code: '',
        ward_code: '',
        postal_code: '',
        phone_number: '',
        address: '',
        is_default: false
    });
    const [promoCode, setPromoCode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const { items, total, updateQuantity, removeItem } = useCart();
    
    const { data: locationData, error: locationError, mutate: mutateLocations } = useSWR<LocationResponse>('/api/locations', fetcher);
    const { data: provinceData } = useSWR<{data: Province[]}>('/api/locations/p', fetcher);
    const { data: districtData } = useSWR<{data: District[]}>(
        newLocation.province_code ? `/api/locations/d/${newLocation.province_code}` : null,
        fetcher
    );
    const { data: wardData } = useSWR<{data: Ward[]}>(
        newLocation.district_code ? `/api/locations/w/${newLocation.district_code}` : null,
        fetcher
    );

    const handleAddLocation = async () => {
        try {
            const response = await fetch('/api/locations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newLocation),
            });

            if (response.ok) {
                setShowAddForm(false);
                mutateLocations();
            }
        } catch (error) {
            console.error('Error adding location:', error);
        }
    };

    useEffect(() => {
        if (locationData?.data?.length > 0) {
            const defaultLocation = locationData.data.find(loc => loc.is_default);
            setSelectedLocation(defaultLocation || locationData.data[0]);
        }
    }, [locationData]);

    // Helper functions to get names from codes
    const getProvinceName = (code: string) => {
        return provinceData?.data.find(province => province.code === code)?.name || '';
    };

    const getDistrictName = (code: string) => {
        return districtData?.data.find(district => district.province_code === code)?.name || '';
    };

    const getWardName = (code: string) => {
        return wardData?.data.find(ward => ward.district_code === code)?.name || '';
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

            {/* Danh sách sản phẩm */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Sản phẩm</h2>
                {items.map((item) => (
                    <div key={item.cart_item_id} className="flex items-center justify-between border-b py-4">
                        <div className="flex items-center">
                            {item.thumbnail_url && (
                                <Image 
                                    src={item.thumbnail_url} 
                                    alt={item.product_name || 'Product'} 
                                    width={80} 
                                    height={80} 
                                    className="rounded-md"
                                />
                            )}
                            <div className="ml-4">
                                <h3 className="font-semibold">{item.product_name}</h3>
                                <p className="text-gray-600">
                                    {item.price ? parseFloat(item.price).toLocaleString('vi-VN') : 0} ₫
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button 
                                onClick={() => item.cart_item_id && item.product_id && item.quantity && 
                                    updateQuantity(item.cart_id, item.cart_item_id, item.product_id, item.quantity - 1)} 
                                className="px-2 py-1 bg-gray-200 rounded"
                            >
                                -
                            </button>
                            <span className="mx-2">{item.quantity || 0}</span>
                            <button 
                                onClick={() => item.cart_item_id && item.product_id && item.quantity && 
                                    updateQuantity(item.cart_id, item.cart_item_id, item.product_id, item.quantity + 1)} 
                                className="px-2 py-1 bg-gray-200 rounded"
                            >
                                +
                            </button>
                            <button 
                                onClick={() => item.cart_id && item.cart_item_id && item.product_id && 
                                    removeItem(item.cart_id, item.cart_item_id, item.product_id)}
                                className="ml-4 text-red-500 hover:text-red-700"
                            >
                                <FaTrash size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Địa chỉ nhận hàng */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <FaMapMarkerAlt className="text-blue-500 mr-2" />
                        <h2 className="text-xl font-semibold">Địa chỉ nhận hàng</h2>
                    </div>
                    {!showAddForm && (
                        <button 
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center text-blue-500 hover:text-blue-700"
                        >
                            <FaPlus className="mr-1" /> Thêm địa chỉ mới
                        </button>
                    )}
                </div>

                {showAddForm ? (
                    <div className="space-y-4">
                        <select
                            value={newLocation.province_code}
                            onChange={(e) => {
                                setNewLocation({
                                    ...newLocation, 
                                    province_code: e.target.value,
                                    district_code: '',
                                    ward_code: ''
                                })
                            }}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Chọn tỉnh/thành phố</option>
                            {provinceData?.data?.map(province => (
                                <option key={province.id} value={province.code}>
                                    {province.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={newLocation.district_code}
                            onChange={(e) => {
                                setNewLocation({
                                    ...newLocation, 
                                    district_code: e.target.value,
                                    ward_code: ''
                                })
                            }}
                            disabled={!newLocation.province_code}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Chọn quận/huyện</option>
                            {districtData?.data?.map(district => (
                                <option key={district.id} value={district.province_code}>
                                    {district.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={newLocation.ward_code}
                            onChange={(e) => setNewLocation({...newLocation, ward_code: e.target.value})}
                            disabled={!newLocation.district_code}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Chọn phường/xã</option>
                            {wardData?.data?.map(ward => (
                                <option key={ward.id} value={ward.district_code}>
                                    {ward.name}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"
                            placeholder="Số nhà, tên đường" 
                            value={newLocation.address}
                            onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Số điện thoại"
                            value={newLocation.phone_number}
                            onChange={(e) => setNewLocation({...newLocation, phone_number: e.target.value})}
                            className="w-full p-2 border rounded"
                        />
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handleAddLocation}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Lưu địa chỉ
                            </button>
                            <button 
                                onClick={() => setShowAddForm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                ) : locationData?.data?.length ? (
                    <div className="space-y-4">
                        {locationData.data.map((location) => (
                            <div 
                                key={location.id}
                                className={`p-4 border rounded ${selectedLocation?.id === location.id ? 'border-blue-500' : ''}`}
                                onClick={() => setSelectedLocation(location)}
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-semibold">Số điện thoại: {location.phone_number}</p>
                                        <p>Địa chỉ: {location.address}, {getWardName(location.ward_code)}, {getDistrictName(location.district_code)}, {getProvinceName(location.province_code)}</p>
                                    </div>
                                    {location.is_default && (
                                        <span className="text-blue-500">Mặc định</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Chưa có địa chỉ nhận hàng. Vui lòng thêm địa chỉ mới.</p>
                )}
            </div>

            {/* Mã giảm giá */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex items-center mb-4">
                    <FaTag className="text-green-500 mr-2" />
                    <h2 className="text-xl font-semibold">Mã giảm giá</h2>
                </div>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 p-3 border rounded-md"
                        placeholder="Nhập mã giảm giá..."
                    />
                    <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600">
                        Áp dụng
                    </button>
                </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex items-center mb-4">
                    <FaCreditCard className="text-purple-500 mr-2" />
                    <h2 className="text-xl font-semibold">Phương thức thanh toán</h2>
                </div>
                <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                        <input
                            type="radio"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="form-radio"
                        />
                        <span>Thanh toán khi nhận hàng (COD)</span>
                    </label>
                    <label className="flex items-center space-x-3">
                        <input
                            type="radio"
                            value="banking"
                            checked={paymentMethod === 'banking'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="form-radio"
                        />
                        <span>Chuyển khoản ngân hàng</span>
                    </label>
                </div>
            </div>

            {/* Tổng tiền và nút thanh toán */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between mb-4">
                    <span className="font-semibold">Tổng tiền hàng:</span>
                    <span>{total.toLocaleString()} ₫</span>
                </div>
                <div className="flex justify-between mb-4">
                    <span className="font-semibold">Phí vận chuyển:</span>
                    <span>30,000 ₫</span>
                </div>
                <div className="flex justify-between mb-6">
                    <span className="font-semibold">Tổng thanh toán:</span>
                    <span className="text-xl text-red-500 font-bold">{(total + 30000).toLocaleString()} ₫</span>
                </div>
                <button className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 font-semibold">
                    Đặt hàng
                </button>
            </div>
        </div>
    );
};

export default Page;