'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import useApi from '@/lib/useApi';

interface Item {
  id: number;
  name: string;
}

interface ApiResponse {
  status: number;
  message: string;
  data: Item[];
}

interface SelectDataProps {
  endpoint: string;
  multiple?: boolean;
  placeholder?: string;
  onSelect: (value: number | number[]) => void;
  defaultValue?: number | number[];
}

const SelectData = ({
  endpoint,
  multiple = false,
  placeholder = 'Select items...',
  onSelect,
  defaultValue,
}: SelectDataProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const { data, loading, error, fetchData } = useApi<ApiResponse>(endpoint);

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  useEffect(() => {
    if (data?.data) {
      setItems(data.data);
    }
  }, [data]);

  useEffect(() => {
    if (defaultValue) {
      const initialSelected = Array.isArray(defaultValue)
        ? defaultValue
        : [defaultValue];
      setSelectedItems(initialSelected);
    } else {
      setSelectedItems([]);
    }
  }, [defaultValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (id: number) => {
    if (multiple) {
      const newSelected = selectedItems.includes(id)
        ? selectedItems.filter(item => item !== id)
        : [...selectedItems, id];
      setSelectedItems(newSelected);
      onSelect(newSelected);
    } else {
      setSelectedItems([id]);
      onSelect(id);
      setIsOpen(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setIsOpen(true);
  };

  const filteredItems = items?.filter(item =>
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  ) || [];

  const getSelectedNames = () => {
    return selectedItems
      .map(id => items.find(item => item.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading items</div>;
  }

  return (
    <div className="relative" ref={selectRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleSearch}
        onFocus={() => setIsOpen(true)}
        className="w-full px-3 py-2 border rounded-md"
      />
      {selectedItems.length > 0 && !searchValue && (
        <div className="mt-1 text-sm text-gray-600">
          {getSelectedNames()}
        </div>
      )}
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={cn(
                  "px-3 py-2 cursor-pointer hover:bg-gray-100",
                  selectedItems.includes(item.id) && "bg-blue-50"
                )}
              >
                {item.name}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectData;
