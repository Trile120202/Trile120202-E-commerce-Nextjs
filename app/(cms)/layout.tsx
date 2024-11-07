'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import {FaHome, FaBox, FaUsers, FaCog, FaTags, FaImage, FaList, FaShoppingCart, FaMemory, FaHdd, FaPercent, FaUserTag} from 'react-icons/fa';
import {FaImages} from "react-icons/fa6";
import { FaBars } from 'react-icons/fa';

const menuItems = [
    { href: '/quan-tri', icon: FaHome, label: 'Dashboard' },
    { href: '/quan-tri/quan-ly-san-pham', icon: FaBox, label: 'Quản lý sản phẩm' },
    { href: '/quan-tri/quan-ly-loai-san-pham', icon: FaList, label: 'Quản lý loại sản phẩm' },
    { href: '/quan-tri/quan-ly-tu-khoa', icon: FaTags, label: 'Quản lý từ khóa' },
    { href: '/quan-tri/quan-ly-media', icon: FaImage, label: 'Quản lý media' },
    { href: '/quan-tri/ram', icon: FaMemory, label: 'Quản lý ram' },
    { href: '/quan-tri/quan-ly-o-cung', icon: FaHdd, label: 'Quản lý ổ cứng' },
    { href: '/quan-tri/quan-ly-don-hang', icon: FaShoppingCart, label: 'Quản lý đơn hàng' },
    { href: '/quan-tri/quan-ly-banner', icon: FaImages, label: 'Quản lý banner' },
    { href: '/quan-tri/quan-ly-khuyen-mai', icon: FaPercent, label: 'Quản lý khuyến mãi' },
    { href: '/quan-tri/quan-ly-nguoi-dung', icon: FaUsers, label: 'Quản lý người dùng' },
    { href: '/quan-tri/quan-ly-vai-tro', icon: FaUserTag, label: 'Quản lý vai trò' },
    { href: '/quan-tri/cai-dat', icon: FaCog, label: 'Cài đặt' },
];

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

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
                    </ul>
                </nav>
            </aside>
        </>
    );
};

const Layout = ({
                    children,
                }: Readonly<{
    children: React.ReactNode;
}>) => {
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
