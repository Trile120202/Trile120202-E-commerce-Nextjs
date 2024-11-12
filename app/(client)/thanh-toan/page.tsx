"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaMapMarkerAlt, FaTag, FaCreditCard, FaTrash, FaPlus, FaPencilAlt } from 'react-icons/fa';
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
    address: string;
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
    code: string;
    name: string;
    id: number;
}

interface Ward {
    district_code: string;
    code: string;
    name: string;
    id: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const Page = () => {
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
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

    const validateForm = () => {
        const errors: {[key: string]: string} = {};
        
        if (!newLocation.province_code) errors.province = 'Vui lòng chọn tỉnh/thành phố';
        if (!newLocation.district_code) errors.district = 'Vui lòng chọn quận/huyện';
        if (!newLocation.ward_code) errors.ward = 'Vui lòng chọn phường/xã';
        if (!newLocation.address.trim()) errors.address = 'Vui lòng nhập địa chỉ cụ thể';
        
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(newLocation.phone_number)) {
            errors.phone = 'Số điện thoại không hợp lệ (10 số)';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddLocation = async () => {
        if (!validateForm()) return;

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

    const handleEditLocation = async (location: Location) => {
        setEditingLocation(location);
        setNewLocation({
            province_code: location.province_code,
            district_code: location.district_code,
            ward_code: location.ward_code,
            postal_code: location.postal_code,
            phone_number: location.phone_number,
            address: location.address,
            is_default: location.is_default
        });
        setShowAddForm(true);
    };

    const handleUpdateLocation = async () => {
        if (!editingLocation || !validateForm()) return;
        
        try {
            const response = await fetch('/api/locations/update-location', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editingLocation.id,
                    ...newLocation
                }),
            });

            if (response.ok) {
                setShowAddForm(false);
                setEditingLocation(null);
                mutateLocations();
            }
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    const handleDeleteLocation = async (locationId: number) => {
        try {
            const response = await fetch('/api/locations/update-location', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: locationId
                }),
            });

            if (response.ok) {
                mutateLocations();
            }
        } catch (error) {
            console.error('Error deleting location:', error);
        }
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 10) {
            setNewLocation({...newLocation, phone_number: value});
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
                            onClick={() => {
                                setShowAddForm(true);
                                setEditingLocation(null);
                                setNewLocation({
                                    province_code: '',
                                    district_code: '',
                                    ward_code: '',
                                    postal_code: '',
                                    phone_number: '',
                                    address: '',
                                    is_default: false
                                });
                                setFormErrors({});
                            }}
                            className="flex items-center text-blue-500 hover:text-blue-700"
                        >
                            <FaPlus className="mr-1" /> Thêm địa chỉ mới
                        </button>
                    )}
                </div>

                {showAddForm ? (
                    <div className="space-y-4">
                        <div>
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
                                className={`w-full p-2 border rounded ${formErrors.province ? 'border-red-500' : ''}`}
                            >
                                <option value="">Chọn tỉnh/thành phố</option>
                                {provinceData?.data?.map(province => (
                                    <option key={province.id} value={province.code}>
                                        {province.name}
                                    </option>
                                ))}
                            </select>
                            {formErrors.province && <p className="text-red-500 text-sm mt-1">{formErrors.province}</p>}
                        </div>

                        <div>
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
                                className={`w-full p-2 border rounded ${formErrors.district ? 'border-red-500' : ''}`}
                            >
                                <option value="">Chọn quận/huyện</option>
                                {districtData?.data?.map(district => (
                                    <option key={district.id} value={district.code}>
                                        {district.name}
                                    </option>
                                ))}
                            </select>
                            {formErrors.district && <p className="text-red-500 text-sm mt-1">{formErrors.district}</p>}
                        </div>

                        <div>
                            <select
                                value={newLocation.ward_code}
                                onChange={(e) => setNewLocation({...newLocation, ward_code: e.target.value})}
                                disabled={!newLocation.district_code}
                                className={`w-full p-2 border rounded ${formErrors.ward ? 'border-red-500' : ''}`}
                            >
                                <option value="">Chọn phường/xã</option>
                                {wardData?.data?.map(ward => (
                                    <option key={ward.id} value={ward.code}>
                                        {ward.name}
                                    </option>
                                ))}
                            </select>
                            {formErrors.ward && <p className="text-red-500 text-sm mt-1">{formErrors.ward}</p>}
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Số nhà, tên đường" 
                                value={newLocation.address}
                                onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                                className={`w-full p-2 border rounded ${formErrors.address ? 'border-red-500' : ''}`}
                            />
                            {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Số điện thoại"
                                value={newLocation.phone_number}
                                onChange={handlePhoneNumberChange}
                                className={`w-full p-2 border rounded ${formErrors.phone ? 'border-red-500' : ''}`}
                            />
                            {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                        </div>

                        <div className="flex items-center gap-4">
                            <button 
                                onClick={editingLocation ? handleUpdateLocation : handleAddLocation}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                {editingLocation ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}
                            </button>
                            <button 
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingLocation(null);
                                    setFormErrors({});
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                ) : locationData?.data?.length ? (
                    <ul className="space-y-4">
                        {locationData.data.map((location) => (
                            <li 
                                key={location.id}
                                className={`p-4 border rounded ${selectedLocation?.id === location.id ? 'border-blue-500' : ''}`}
                            >
                                <div className="flex justify-between">
                                    <div className="flex-1" onClick={() => setSelectedLocation(location)}>
                                        <p className="font-semibold">Số điện thoại: {location.phone_number}</p>
                                        <p>Địa chỉ: {location.address}, {getWardName(location.ward_code)}, {getDistrictName(location.district_code)}, {getProvinceName(location.province_code)}</p>
                                    </div>
                                    <div className="flex items-start space-x-2 ml-4">
                                        <button 
                                            onClick={() => handleEditLocation(location)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <FaPencilAlt size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteLocation(location.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                        {location.is_default && (
                                            <span className="text-blue-500 ml-2">Mặc định</span>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
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