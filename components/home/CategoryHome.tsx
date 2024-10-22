"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useFetch from "@/lib/useFetch";

interface Category {
  image_url: string;
  id: number;
  name: string;
}

interface ApiResponse {
  status: number;
  message: string;
  data: Category[];
}

const CategoryHome: React.FC = () => {
  const { data, loading, error } = useFetch<ApiResponse>('/api/categories/all-category');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  if (loading) return <div></div>;
  if (error) return <div className="text-black">Error: {error}</div>;

  const filteredCategories = data?.data?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.id.toString().includes(searchTerm)
  );

  return (
    <div className="container mx-auto px-4 py-4 text-black">
      <h2 className="text-2xl font-bold mb-4">Product Categories</h2>
      {isMobile ? (
        <div>
          <div 
            className="w-full p-2 border rounded-lg mb-2"
            onClick={() => setShowMobileList(!showMobileList)}
          >
            Select a category
          </div>
          {showMobileList && (
            <div className="border rounded-lg">
              <input
                type="text"
                placeholder="Search categories..."
                className="w-full p-2 border-b text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <ul className="max-h-60 overflow-y-auto">
                {filteredCategories && filteredCategories.map((category) => (
                  <li key={category.id} className="p-2 hover:bg-gray-100">
                    <Link href={`/category/${category.id}`} className="text-black">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data && data.data && data.data.map((category) => (
            <Link href={`/category/${category.id}`} key={category.id} className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:scale-105">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={`${category.image_url}`}
                  alt={category.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <h3 className="text-sm font-semibold truncate px-3 text-black">{category.name}</h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryHome;
