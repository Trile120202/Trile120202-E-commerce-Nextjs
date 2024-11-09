'use client';

import React, { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import useApi from '@/lib/useApi';

interface Item {
    id: number;
    name: string;
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
    placeholder = "Select items...",
    onSelect,
    defaultValue
}: SelectDataProps) => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [searchValue, setSearchValue] = useState("");
    
    const { get } = useApi();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await get(endpoint);
                if (response.data) {
                    setItems(response.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [endpoint]);

    useEffect(() => {
        if (defaultValue) {
            if (Array.isArray(defaultValue)) {
                setSelectedItems(defaultValue);
            } else {
                setSelectedItems([defaultValue]);
            }
        }
    }, [defaultValue]);

    const handleSelect = (itemId: number) => {
        let newSelectedItems: number[];
        
        if (multiple) {
            if (selectedItems.includes(itemId)) {
                newSelectedItems = selectedItems.filter(id => id !== itemId);
            } else {
                newSelectedItems = [...selectedItems, itemId];
            }
        } else {
            newSelectedItems = [itemId];
            setOpen(false);
        }
        
        setSelectedItems(newSelectedItems);
        onSelect(multiple ? newSelectedItems : itemId);
    };

    const getSelectedItemNames = () => {
        return selectedItems
            .map(id => items.find(item => item.id === id)?.name)
            .filter(Boolean)
            .join(", ");
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedItems.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {multiple ? (
                                selectedItems.map((id) => (
                                    <Badge 
                                        key={id} 
                                        variant="secondary"
                                        className="mr-1"
                                    >
                                        {items.find(item => item.id === id)?.name}
                                    </Badge>
                                ))
                            ) : (
                                <span>{getSelectedItemNames()}</span>
                            )}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput 
                        placeholder="Search..." 
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandEmpty>No items found.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-auto">
                        {filteredItems.map((item) => (
                            <CommandItem
                                key={item.id}
                                value={item.name}
                                onSelect={() => handleSelect(item.id)}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedItems.includes(item.id) ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {item.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default SelectData;
