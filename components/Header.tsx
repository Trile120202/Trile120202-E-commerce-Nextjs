"use client"
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from './AuthModal';

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const DesktopMenu = () => (
    <nav className="hidden lg:flex lg:items-center lg:w-auto">
      <form onSubmit={handleSearch} className="relative mr-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className="w-64 px-4 py-2 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>
      <ul className="flex flex-row space-x-4 items-center">
        <li>
          <Link href="/" className="text-white hover:text-yellow-300 transition duration-300">Trang chủ</Link>
        </li>
        <li>
          <Link href="/gioi-thieu" className="text-white hover:text-yellow-300 transition duration-300">Giới thiệu</Link>
        </li>
        <li>
          <Link href="/lien-he" className="text-white hover:text-yellow-300 transition duration-300">Liên hệ</Link>
        </li>
        <li>
          <button
            onClick={openAuthModal}
            className="bg-white text-blue-700 px-4 py-2 rounded hover:bg-yellow-300 hover:text-blue-800 transition duration-300 flex items-center justify-center"
          >
            Đăng nhập
          </button>
        </li>
        <li>
          <Link href="/gio-hang" className="flex items-center justify-center text-white hover:text-yellow-300 transition duration-300">
            <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Giỏ hàng
          </Link>
        </li>
      </ul>
    </nav>
  );

  const MobileMenu = () => (
    <div className={`lg:hidden w-full mt-4 ${isMenuOpen ? 'block' : 'hidden'}`}>
      <form onSubmit={handleSearch} className="relative mb-4">
        <input
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full px-4 py-2 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>
      <ul className="flex flex-col space-y-2 items-center">
        <li>
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-yellow-300 transition duration-300 block">Trang chủ</Link>
        </li>
        <li>
          <Link href="/gioi-thieu" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-yellow-300 transition duration-300 block">Giới thiệu</Link>
        </li>
        <li>
          <Link href="/lien-he" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-yellow-300 transition duration-300 block">Liên hệ</Link>
        </li>
        <li className="w-full">
          <button
            onClick={() => { openAuthModal(); setIsMenuOpen(false); }}
            className="bg-white text-blue-700 px-4 py-2 rounded hover:bg-yellow-300 hover:text-blue-800 transition duration-300 w-full flex items-center justify-center"
          >
            Đăng nhập
          </button>
        </li>
        <li className="w-full">
          <Link href="/gio-hang" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center text-white hover:text-yellow-300 transition duration-300 block">
            <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Giỏ hàng
          </Link>
        </li>
      </ul>
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 bg-blue-700 text-white p-4 z-50">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <div>
          <Link href="/">
            <h1 className="text-2xl font-bold text-white cursor-pointer">Z-Shop</h1>
          </Link>
        </div>
        <button 
          className="lg:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <DesktopMenu />
        <MobileMenu />
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </header>
  );
}