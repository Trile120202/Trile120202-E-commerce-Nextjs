"use client"
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from './AuthModal';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentScrollY = latest;
    if (currentScrollY < lastScrollY.current) {
      setIsVisible(true);
    } else if (currentScrollY > 100 && currentScrollY > lastScrollY.current) {
      setIsVisible(false);
    }
    lastScrollY.current = currentScrollY;
  });

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearchExpand = () => {
    setIsSearchExpanded(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);
    collapseTimeoutRef.current = setTimeout(() => {
      if (!searchQuery.trim()) {
        handleSearchCollapse();
      }
    }, 10000);
  };

  const handleSearchCollapse = () => {
    setIsSearchExpanded(false);
    setSearchQuery('');
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`);
      handleSearchCollapse();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(handleSearch, 1500);
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, []);

  const DesktopMenu = () => (
    <nav className="hidden lg:flex lg:items-center lg:w-auto">
      <ul className="flex flex-row space-x-4 items-center">
        <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Link href="/" className="text-white hover:text-yellow-300 transition duration-300">Trang chủ</Link>
        </motion.li>
        <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Link href="/gioi-thieu" className="text-white hover:text-yellow-300 transition duration-300">Giới thiệu</Link>
        </motion.li>
        <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Link href="/lien-he" className="text-white hover:text-yellow-300 transition duration-300">Liên hệ</Link>
        </motion.li>
        <li className="relative">
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <motion.div
              initial={false}
              animate={{ width: isSearchExpanded ? 'auto' : '2.5rem' }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex items-center bg-white rounded-full overflow-hidden"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={isSearchExpanded ? handleSearch : handleSearchExpand}
                className="bg-yellow-300 text-blue-700 p-2 rounded-full hover:bg-yellow-400 transition duration-300 focus:outline-none flex items-center justify-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </motion.button>
              <AnimatePresence>
                {isSearchExpanded && (
                  <motion.input
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '100%' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    ref={searchInputRef}
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="px-3 py-2 w-full text-black focus:outline-none"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </form>
        </li>
        <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <button
            onClick={openAuthModal}
            className="bg-white text-blue-700 px-4 py-2 rounded hover:bg-yellow-300 hover:text-blue-800 transition duration-300 flex items-center justify-center"
          >
            Đăng nhập
          </button>
        </motion.li>
        <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Link href="/gio-hang" className="flex items-center justify-center text-white hover:text-yellow-300 transition duration-300">
            <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Giỏ hàng
          </Link>
        </motion.li>
      </ul>
    </nav>
  );

  const MobileMenu = () => (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="lg:hidden w-full mt-4"
        >
          <ul className="flex flex-col space-y-2 items-center">
            <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-yellow-300 transition duration-300 block">Trang chủ</Link>
            </motion.li>
            <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link href="/gioi-thieu" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-yellow-300 transition duration-300 block">Giới thiệu</Link>
            </motion.li>
            <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link href="/lien-he" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-yellow-300 transition duration-300 block">Liên hệ</Link>
            </motion.li>
            <li className="relative w-full">
              <form onSubmit={(e) => { handleSearchSubmit(e); setIsMenuOpen(false); }} className="flex items-center">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="flex items-center bg-white rounded-full overflow-hidden w-full"
                >
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="px-3 py-2 w-full text-black focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-yellow-300 text-blue-700 p-2 rounded-full hover:bg-yellow-400 transition duration-300 focus:outline-none flex items-center justify-center"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </motion.button>
                </motion.div>
              </form>
            </li>
            <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
              <button
                onClick={() => { openAuthModal(); setIsMenuOpen(false); }}
                className="bg-white text-blue-700 px-4 py-2 rounded hover:bg-yellow-300 hover:text-blue-800 transition duration-300 w-full flex items-center justify-center"
              >
                Đăng nhập
              </button>
            </motion.li>
            <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
              <Link href="/gio-hang" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center text-white hover:text-yellow-300 transition duration-300 block">
                <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Giỏ hàng
              </Link>
            </motion.li>
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 bg-blue-700 text-white p-4 z-50"
    >
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Link href="/">
            <h1 className="text-2xl font-bold text-white cursor-pointer">Z-Shop</h1>
          </Link>
        </motion.div>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="lg:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </motion.button>
        <DesktopMenu />
        <MobileMenu />
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </motion.header>
  );
}