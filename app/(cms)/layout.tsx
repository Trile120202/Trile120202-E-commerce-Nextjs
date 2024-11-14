'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import {
    FaHome, FaBox, FaUsers, FaCog, FaTags, FaImage, FaList, FaShoppingCart, FaPercent, FaUserTag, 
    FaBars, FaMemory, FaHdd, FaVideo, FaMicrochip, FaDesktop 
} from 'react-icons/fa';
import { FaImages } from "react-icons/fa6";

const menuItems = [
    { href: '/quan-tri', icon: FaHome, label: 'Dashboard' },
    { href: '/quan-tri/quan-ly-san-pham', icon: FaBox, label: 'Quản lý sản phẩm' },
    { href: '/quan-tri/quan-ly-loai-san-pham', icon: FaList, label: 'Quản lý loại sản phẩm' },
    { href: '/quan-tri/quan-ly-tu-khoa', icon: FaTags, label: 'Quản lý từ khóa' },
    { href: '/quan-tri/quan-ly-media', icon: FaImage, label: 'Quản lý media' },
    { href: '/quan-tri/quan-ly-don-hang', icon: FaShoppingCart, label: 'Quản lý đơn hàng' },
    { href: '/quan-tri/quan-ly-banner', icon: FaImages, label: 'Quản lý banner' },
    { href: '/quan-tri/quan-ly-khuyen-mai', icon: FaPercent, label: 'Quản lý khuyến mãi' },
    { href: '/quan-tri/quan-ly-nguoi-dung', icon: FaUsers, label: 'Quản lý người dùng' },
    { href: '/quan-tri/quan-ly-vai-tro', icon: FaUserTag, label: 'Quản lý vai trò' },
    { href: '/quan-tri/cai-dat', icon: FaCog, label: 'Cài đặt' },
];

const peripheralDevices = [
    { href: '/quan-tri/ram', icon: FaMemory, label: 'Quản lý RAM' },
    { href: '/quan-tri/quan-ly-o-cung', icon: FaHdd, label: 'Quản lý ổ cứng' },
    { href: '/quan-tri/quan-ly-card-man-hinh', icon: FaVideo, label: 'Quản lý card màn hình' },
    { href: '/quan-tri/quan-ly-cpu', icon: FaMicrochip, label: 'Quản lý CPU' },
    { href: '/quan-tri/quan-ly-man-hinh', icon: FaDesktop, label: 'Quản lý màn hình' },
];

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPeripheralOpen, setIsPeripheralOpen] = useState(false);

    return (
        <>
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FaBars className="w-6 h-6" />
            </button>

            <aside className={`bg-gray-800 text-white w-64 min-h-screen p-4 fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto ${
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            } lg:static lg:translate-x-0`}>
                <div className="mb-6 text-xl lg:text-2xl font-bold text-center pt-2">Z-Shop</div>
                <nav className="mt-8">
                    <ul className="space-y-2">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <Link href={item.href}
                                      className="flex items-center p-3 hover:bg-gray-700 rounded transition-colors duration-200 text-sm lg:text-base"
                                      onClick={() => setIsOpen(false)}>
                                    <item.icon className="w-5 h-5 mr-3"/>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <button
                                className="flex items-center p-3 w-full hover:bg-gray-700 rounded transition-colors duration-200 text-sm lg:text-base"
                                onClick={() => setIsPeripheralOpen(!isPeripheralOpen)}
                            >
                                <FaMicrochip className="w-5 h-5 mr-3" />
                                Thiết bị ngoại vi
                            </button>
                            {isPeripheralOpen && (
                                <ul className="pl-6 space-y-2">
                                    {peripheralDevices.map((device, index) => (
                                        <li key={index}>
                                            <Link href={device.href}
                                                  className="flex items-center p-3 hover:bg-gray-700 rounded transition-colors duration-200 text-sm lg:text-base"
                                                  onClick={() => setIsOpen(false)}>
                                                <device.icon className="w-5 h-5 mr-3"/>
                                                {device.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    </ul>
                </nav>
            </aside>
        </>
    );
};

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar/>
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-md p-4 pl-16 lg:pl-4">
                    <h1 className="text-lg lg:text-2xl font-bold">CMS Dashboard</h1>
                </header>
                <main className="flex-1 p-4 lg:p-6 bg-gray-200 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
