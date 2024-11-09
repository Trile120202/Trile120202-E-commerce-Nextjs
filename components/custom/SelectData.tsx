'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import useApi from '@/lib/useApi';
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi';

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
    setSearchValue('');
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

  const removeSelected = (id: number) => {
    const newSelected = selectedItems.filter(item => item !== id);
    setSelectedItems(newSelected);
    onSelect(multiple ? newSelected : newSelected[0]);
  };

  if (loading) {
    return (
      <div className="w-full h-10 bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-2 bg-red-50 border border-red-200 rounded-lg text-red-500 text-sm text-center">
        Error loading items
      </div>
    );
  }

  return (
    <div className="relative" ref={selectRef}>
      <div className="relative">
        <div className="relative flex items-center">
          <FiSearch className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={handleSearch}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
          />
          <FiChevronDown 
            className={cn(
              "absolute right-3 text-gray-400 transition-transform duration-200",
              isOpen && "transform rotate-180"
            )}
          />
        </div>
      </div>

      {selectedItems.length > 0 && !searchValue && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedItems.map(id => {
            const item = items.find(i => i.id === id);
            return item ? (
              <div
                key={id}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
              >
                <span>{item.name}</span>
                <FiX
                  className="w-4 h-4 cursor-pointer hover:text-blue-800"
                  onClick={() => removeSelected(id)}
                />
              </div>
            ) : null;
          })}
        </div>
      )}
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={cn(
                  "px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors",
                  selectedItems.includes(item.id) && "bg-blue-50 text-blue-600 font-medium"
                )}
              >
                {item.name}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center text-sm">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectData;
