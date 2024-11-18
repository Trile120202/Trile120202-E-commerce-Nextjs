"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaShoppingCart, FaClipboardList, FaUser } from 'react-icons/fa';
import { Button } from './ui/button';
import { Input } from './ui/input';

const URLS = {
  HOME: '/',
  ABOUT: '/gioi-thieu',
  CONTACT: '/lien-he', 
  LOGIN: '/dang-nhap',
  CART: '/gio-hang',
  ORDERS: '/don-hang',
  SEARCH: '/san-pham?search=',
  AUTH_ME: '/api/auth/me',
  AUTH_LOGOUT: '/api/auth/logout',
  PROFILE: '/trang-ca-nhan',
};

interface User {
  username: string;
  email: string;
  roleId: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(URLS.AUTH_ME, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    try {
      await fetch(URLS.AUTH_LOGOUT, {
        method: 'POST',
        credentials: 'include'
      });

      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = URLS.HOME;
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const encodedSearchQuery = encodeURIComponent(searchQuery.normalize('NFC')).replace(/%20/g, '+');
      router.push(`${URLS.SEARCH}${encodedSearchQuery}`);
      setSearchQuery(''); 
    }
  };

  const DesktopMenu = () => (
    <nav className="hidden lg:flex lg:items-center lg:w-auto">
      {/* <form onSubmit={handleSearch} className="relative mr-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className="w-64 px-4 py-2 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          autoFocus
          lang="vi"
          inputMode="search"
        />
        <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form> */}
      <ul className="flex flex-row space-x-4 items-center">
        <li>
          <Link href={URLS.HOME} className="text-white hover:text-yellow-300 transition duration-300">Trang chủ</Link>
        </li>
        <li>
          <Link href={URLS.ABOUT} className="text-white hover:text-yellow-300 transition duration-300">Giới thiệu</Link>
        </li>
        <li>
          <Link href={URLS.CONTACT} className="text-white hover:text-yellow-300 transition duration-300">Liên hệ</Link>
        </li>
        <li>
          {user ? (
            <button onClick={handleLogout} className="text-white hover:text-yellow-300 transition duration-300">Đăng xuất</button>
          ) : (
            <Link href={URLS.LOGIN} className="text-white hover:text-yellow-300 transition duration-300">Đăng nhập</Link>
          )}
        </li>
        {user && (
          <>
            <li>
              <Link href={URLS.CART} className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-lg transition duration-300">
                <FaShoppingCart className="w-5 h-5" />
              </Link>
            </li>
            <li>
              <Link href={URLS.ORDERS} className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-lg transition duration-300">
                <FaClipboardList className="w-5 h-5" />
              </Link>
            </li>
            <li>
              <Link href={URLS.PROFILE} className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-lg transition duration-300">
                <FaUser className="w-5 h-5" />
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );

  const MobileMenu = () => (
    <div className={`lg:hidden w-full mt-4 ${isMenuOpen ? 'block' : 'hidden'}`}>
      {/* <form onSubmit={handleSearch} className="relative mb-4">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full px-4 py-2 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          autoFocus
          lang="vi"
          inputMode="search"
        />
        <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form> */}
      <ul className="flex flex-col space-y-2 items-center">
        <li>
          <Link href={URLS.HOME} onClick={() => setIsMenuOpen(false)} className="text-white hover:text-yellow-300 transition duration-300 block">Trang chủ</Link>
        </li>
        <li>
          <Link href={URLS.ABOUT} onClick={() => setIsMenuOpen(false)} className="text-white hover:text-yellow-300 transition duration-300 block">Giới thiệu</Link>
        </li>
        <li>
          <Link href={URLS.CONTACT} onClick={() => setIsMenuOpen(false)} className="text-white hover:text-yellow-300 transition duration-300 block">Liên hệ</Link>
        </li>
        <li className="w-full">
          {user ? (
            <button 
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="bg-white text-blue-700 px-4 py-2 rounded hover:bg-yellow-300 hover:text-blue-800 transition duration-300 w-full flex items-center justify-center"
            >
              Đăng xuất
            </button>
          ) : (
            <Link 
              href={URLS.LOGIN}
              onClick={() => setIsMenuOpen(false)} 
              className="bg-white text-blue-700 px-4 py-2 rounded hover:bg-yellow-300 hover:text-blue-800 transition duration-300 w-full flex items-center justify-center"
            >
              Đăng nhập
            </Link>
          )}
        </li>
        {user && (
          <>
            <li className="w-full">
              <Link 
                href={URLS.CART} 
                onClick={() => setIsMenuOpen(false)} 
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white w-10 h-10 rounded transition duration-300 mx-auto"
              >
                <FaShoppingCart className="w-5 h-5" />
              </Link>
            </li>
            <li className="w-full">
              <Link 
                href={URLS.ORDERS} 
                onClick={() => setIsMenuOpen(false)} 
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white w-10 h-10 rounded transition duration-300 mx-auto"
              >
                <FaClipboardList className="w-5 h-5" />
              </Link>
            </li>
            <li className="w-full">
              <Link 
                href={URLS.PROFILE} 
                onClick={() => setIsMenuOpen(false)} 
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white w-10 h-10 rounded transition duration-300 mx-auto"
              >
                <FaUser className="w-5 h-5" />
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 bg-blue-700 text-white p-4 z-50">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <div>
          <Link href={URLS.HOME}>
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
    </header>
  );
}