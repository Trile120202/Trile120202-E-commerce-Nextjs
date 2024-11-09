"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useFetch from "@/lib/useFetch";

interface Category {
  id: number;
  name: string;
  slug: string;
  content: string;
  image_id: number | null;
  created_at: string;
  updated_at: string;
  status: number;
  image_url: string | null;
  image_alt_text: string | null;
}

interface ApiResponse {
  status: number;
  message: string;
  data: Category[];
}

const CategoryHome: React.FC = () => {
  const { data, loading, error } = useFetch<ApiResponse>('/api/categories/all-category');
  const [showMobileList, setShowMobileList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return <div></div>;
  if (error) return <div className="text-black">Error: {error}</div>;

  const filteredCategories = data?.data?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.id.toString().includes(searchTerm)
  );

  return (
    <div className="container mx-auto px-4 py-4 text-black">
      <h2 className="text-2xl font-bold mb-4">Product Categories</h2>
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
    </div>
  );
};

export default CategoryHome;
