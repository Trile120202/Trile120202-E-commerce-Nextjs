'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import {FaHome, FaBox, FaUsers, FaCog, FaTags, FaImage, FaList, FaShoppingCart} from 'react-icons/fa';
import {FaImages} from "react-icons/fa6";
import { FaBars } from 'react-icons/fa';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-gray-800 text-white rounded"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FaBars className="w-6 h-6" />
            </button>

            <aside className={`bg-gray-800 text-white w-64 min-h-screen p-4 fixed lg:static transition-transform duration-300 ease-in-out z-10 ${
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}>
                <div className="mb-6 text-xl lg:text-2xl font-bold text-center">Z-Shop</div>
                <nav>
                    <ul>
                        <li className="mb-4">
                            <Link href="/quan-tri"
                                  className="flex items-center p-2 hover:bg-gray-700 rounded text-sm lg:text-base">
                                <FaHome className="mr-3"/>
                                Dashboard
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link href="/quan-tri/quan-ly-san-pham"
                                  className="flex items-center p-2 hover:bg-gray-700 rounded text-sm lg:text-base">
                                <FaBox className="mr-3"/>
                                Quản lý sản phẩm
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link href="/quan-tri/quan-ly-loai-san-pham"
                                  className="flex items-center p-2 hover:bg-gray-700 rounded text-sm lg:text-base">
                                <FaList className="mr-3"/>
                                Quản lý loại sản phẩm
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link href="/quan-tri/quan-ly-tu-khoa"
                                  className="flex items-center p-2 hover:bg-gray-700 rounded text-sm lg:text-base">
                                <FaTags className="mr-3"/>
                                Quản lý từ khóa
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link href="/quan-tri/quan-ly-media"
                                  className="flex items-center p-2 hover:bg-gray-700 rounded text-sm lg:text-base">
                                <FaImage className="mr-3"/>
                                Quản lý media
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link href="/quan-tri/ram"
                                  className="flex items-center p-2 hover:bg-gray-700 rounded text-sm lg:text-base">
                                <FaImage className="mr-3"/>
                                Quản lý ram
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link href="/quan-tri/quan-ly-o-cung"
                                  className="flex items-center p-2 hover:bg-gray-700 rounded text-sm lg:text-base">
                                <FaImage className="mr-3"/>
                                Quản lý ổ cứng
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link href="/quan-tri/quan-ly-don-hang"
                                  className="flex items-center p-2 hover:bg-gray-700 rounded text-sm lg:text-base">
                                <FaShoppingCart className="mr-3"/>
                                Quản lý đơn hàng
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link href="/quan-tri/quan-ly-banner"
                                  className="flex items-center p-2 hover:bg-gray-700 rounded text-sm lg:text-base">
                                <FaImages className="mr-3"/>
                                Quản lý banner
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link href="/quan-tri/quan-ly-nguoi-dung"
                                  className="flex items-center p-2 hover:bg-gray-700 rounded text-sm lg:text-base">
                                <FaUsers className="mr-3"/>
                                Quản lý người dùng
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link href="/quan-tri/cai-dat"
                                  className="flex items-center p-2 hover:bg-gray-700 rounded text-sm lg:text-base">
                                <FaCog className="mr-3"/>
                                Cài đặt
                            </Link>
                        </li>
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
        <div className="flex h-screen bg-gray-100">
            <Sidebar/>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-md p-4 pl-16 lg:pl-4">
                    <h1 className="text-xl lg:text-2xl font-bold">CMS Dashboard</h1>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
