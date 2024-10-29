'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { FaEdit, FaTrash } from 'react-icons/fa'
import { BsThreeDots } from 'react-icons/bs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import useApi from '@/lib/useApi';
import DataTable from "@/components/custom/datatable";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Ram {
    id: number;
    name: string;
    type: string; // DDR3, DDR4, DDR5
    capacity: number; // GB
    speed: number; // MHz
    brand: string;
    created_at: string;
    updated_at: string;
    status: number;
}

// Mock data
const mockRams: Ram[] = [
    {
        id: 1,
        name: "Corsair Vengeance LPX 4GB",
        type: "DDR4",
        capacity: 4,
        speed: 2666,
        brand: "Corsair",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        status: 1
    },
    {
        id: 2,
        name: "Kingston Fury 8GB",
        type: "DDR4",
        capacity: 8,
        speed: 3200,
        brand: "Kingston",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        status: 1
    },
    {
        id: 3,
        name: "G.Skill Trident Z5 16GB",
        type: "DDR5",
        capacity: 16,
        speed: 6000,
        brand: "G.Skill",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        status: 0
    }
];

const RAM_TYPES = ["DDR3", "DDR4", "DDR5"];
const RAM_CAPACITIES = [4, 8, 16, 32, 64];
const RAM_SPEEDS = [2400, 2666, 3000, 3200, 3600, 4000, 4800, 5200, 6000];
const RAM_BRANDS = ["Corsair", "Kingston", "G.Skill", "Crucial", "TeamGroup", "Samsung"];

interface CreateRamModalProps {
    onCreate: (ram: Ram) => void;
}

const CreateRamModal = ({ onCreate }: CreateRamModalProps) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState('DDR4');
    const [capacity, setCapacity] = useState(8);
    const [speed, setSpeed] = useState(3200);
    const [brand, setBrand] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newRam: Ram = {
                id: mockRams.length + 1,
                name,
                type,
                capacity,
                speed,
                brand,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: 1
            };
            onCreate(newRam);
            setOpen(false);
            setName('');
        } catch (error) {
            console.error('Error creating RAM:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-white text-blue-600 hover:bg-blue-50">
                    <Save className="mr-2 h-4 w-4" />
                    Tạo mới
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Tạo RAM mới</DialogTitle>
                        <DialogDescription>
                            Thêm thông tin RAM mới vào hệ thống
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label htmlFor="name">Tên RAM</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nhập tên RAM"
                            />
                        </div>
                        <div>
                            <Label htmlFor="type">Loại RAM</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại RAM" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RAM_TYPES.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="capacity">Dung lượng (GB)</Label>
                            <Select value={capacity.toString()} onValueChange={(val) => setCapacity(Number(val))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn dung lượng" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RAM_CAPACITIES.map(cap => (
                                        <SelectItem key={cap} value={cap.toString()}>{cap}GB</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="speed">Bus (MHz)</Label>
                            <Select value={speed.toString()} onValueChange={(val) => setSpeed(Number(val))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn bus" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RAM_SPEEDS.map(spd => (
                                        <SelectItem key={spd} value={spd.toString()}>{spd}MHz</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="brand">Hãng sản xuất</Label>
                            <Select value={brand} onValueChange={setBrand}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn hãng" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RAM_BRANDS.map(brand => (
                                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                    <span className="ml-2">Đang xử lý</span>
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    <span>Tạo mới</span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

interface EditRamModalProps {
    ram: Ram;
    onUpdate: (ram: Ram) => void;
    onClose: () => void;
}

const EditRamModal = ({ ram, onUpdate, onClose }: EditRamModalProps) => {
    const [name, setName] = useState(ram.name);
    const [type, setType] = useState(ram.type);
    const [capacity, setCapacity] = useState(ram.capacity);
    const [speed, setSpeed] = useState(ram.speed);
    const [brand, setBrand] = useState(ram.brand);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updatedRam: Ram = {
                ...ram,
                name,
                type,
                capacity,
                speed,
                brand,
                updated_at: new Date().toISOString()
            };
            onUpdate(updatedRam);
        } catch (error) {
            console.error('Error updating RAM:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa RAM</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin RAM
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Tên RAM</Label>
                            <Input
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nhập tên RAM"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-type">Loại RAM</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại RAM" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RAM_TYPES.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-capacity">Dung lượng (GB)</Label>
                            <Select value={capacity.toString()} onValueChange={(val) => setCapacity(Number(val))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn dung lượng" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RAM_CAPACITIES.map(cap => (
                                        <SelectItem key={cap} value={cap.toString()}>{cap}GB</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-speed">Bus (MHz)</Label>
                            <Select value={speed.toString()} onValueChange={(val) => setSpeed(Number(val))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn bus" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RAM_SPEEDS.map(spd => (
                                        <SelectItem key={spd} value={spd.toString()}>{spd}MHz</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-brand">Hãng sản xuất</Label>
                            <Select value={brand} onValueChange={setBrand}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn hãng" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RAM_BRANDS.map(brand => (
                                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                    <span className="ml-2">Đang xử lý</span>
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    <span>Cập nhật</span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

interface Pagination {
    currentPage: number;
    pageSize: number;
    totalItems: string;
    totalPages: number;
}

interface ApiResponse {
    status: number;
    message: string;
    data: {
        rams: Ram[];
        pagination: Pagination;
    };
}

const Page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
    const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'all');
    const [searchKeyword, setSearchKeyword] = useState<string>(searchParams.get('search') || '');
    const [selectedType, setSelectedType] = useState<string>(searchParams.get('type') || 'all');
    const [selectedCapacity, setSelectedCapacity] = useState<string>(searchParams.get('capacity') || 'all');
    const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('brand') || 'all');
    const [limit, setLimit] = useState<number>(Number(searchParams.get('limit')) || 10);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRam, setSelectedRam] = useState<Ram | null>(null);
    const [rams, setRams] = useState<Ram[]>(mockRams);

    const updateUrl = (params: Record<string, string | number>) => {
        const url = new URL(window.location.href);
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                url.searchParams.set(key, String(value));
            } else {
                url.searchParams.delete(key);
            }
        });
        router.push(url.pathname + url.search);
    };

    const handleEdit = (ram: Ram) => {
        setSelectedRam(ram);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setRams(rams.filter(ram => ram.id !== id));
    };

    const handleCreate = (newRam: Ram) => {
        setRams([...rams, newRam]);
    };

    const handleUpdate = (updatedRam: Ram) => {
        setRams(rams.map(ram => ram.id === updatedRam.id ? updatedRam : ram));
        setIsEditModalOpen(false);
    };

    const handleStatusChange = async (id: number, newStatus: number) => {
        setRams(rams.map(ram => 
            ram.id === id ? {...ram, status: newStatus} : ram
        ));
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        updateUrl({...searchParams, page});
    };

    const handleSearchChange = (search: string) => {
        setSearchKeyword(search);
        setCurrentPage(1);
        updateUrl({...searchParams, search, page: 1});
    };

    const handleStatusFilterChange = (status: string) => {
        setSelectedStatus(status);
        setCurrentPage(1);
        updateUrl({...searchParams, status, page: 1});
    };

    const handleTypeFilterChange = (type: string) => {
        setSelectedType(type);
        setCurrentPage(1);
        updateUrl({...searchParams, type, page: 1});
    };

    const handleCapacityFilterChange = (capacity: string) => {
        setSelectedCapacity(capacity);
        setCurrentPage(1);
        updateUrl({...searchParams, capacity, page: 1});
    };

    const handleBrandFilterChange = (brand: string) => {
        setSelectedBrand(brand);
        setCurrentPage(1);
        updateUrl({...searchParams, brand, page: 1});
    };

    const getStatusColor = (status: number) => {
        return status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const columns = [
        { accessor: 'id', label: 'ID', className: 'font-medium' },
        { accessor: 'name', label: 'Tên RAM', className: 'font-medium' },
        { accessor: 'type', label: 'Loại', className: 'font-medium' },
        { accessor: 'capacity', label: 'Dung lượng', render: (row: Ram) => `${row.capacity}GB` },
        { accessor: 'speed', label: 'Bus', render: (row: Ram) => `${row.speed}MHz` },
        { accessor: 'brand', label: 'Hãng sản xuất', className: 'font-medium' },
        { 
            accessor: 'status', 
            label: 'Trạng thái', 
            className: 'text-center hidden md:table-cell',
            render: (row: Ram) => (
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={row.status === 1}
                        onCheckedChange={(checked) => handleStatusChange(row.id, checked ? 1 : 0)}
                    />
                    <span className={`hidden md:inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
                        {row.status === 1 ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                </div>
            )
        },
        { 
            accessor: 'actions', 
            label: 'Thao tác', 
            className: 'text-right',
            render: (row: Ram) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <BsThreeDots className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(row)}>
                            <FaEdit className="mr-2 h-4 w-4" />
                            <span>Sửa</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(row.id)}>
                            <FaTrash className="mr-2 h-4 w-4" />
                            <span>Xóa</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    ];

    // Filter rams based on search and filters
    const filteredRams = rams.filter(ram => {
        const matchesSearch = ram.name.toLowerCase().includes(searchKeyword.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || ram.status === Number(selectedStatus);
        const matchesType = selectedType === 'all' || ram.type === selectedType;
        const matchesCapacity = selectedCapacity === 'all' || ram.capacity === Number(selectedCapacity);
        const matchesBrand = selectedBrand === 'all' || ram.brand === selectedBrand;
        return matchesSearch && matchesStatus && matchesType && matchesCapacity && matchesBrand;
    });

    // Calculate pagination
    const totalItems = filteredRams.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRams = filteredRams.slice(startIndex, endIndex);

    const mockApiResponse: ApiResponse = {
        status: 200,
        message: "Success",
        data: {
            rams: paginatedRams,
            pagination: {
                currentPage,
                pageSize: limit,
                totalItems: String(totalItems),
                totalPages
            }
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="sticky top-0 z-20 bg-white shadow-sm">
                <Card className="rounded-none shadow-none border-0">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 md:p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                            <CardTitle className="text-xl md:text-2xl font-bold">Quản lý RAM</CardTitle>
                            <CreateRamModal onCreate={handleCreate} />
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <div className="flex-1 overflow-auto">
                <DataTable
                    data={mockApiResponse.data.rams}
                    columns={columns}
                    loading={false}
                    error={null}
                    filters={{
                        status: {
                            value: selectedStatus,
                            onChange: handleStatusFilterChange,
                            options: [
                                { label: 'Tất cả', value: 'all' },
                                { label: 'Hoạt động', value: '1' },
                                { label: 'Không hoạt động', value: '0' },
                            ]
                        },
                        type: {
                            value: selectedType,
                            onChange: handleTypeFilterChange,
                            options: [
                                { label: 'Tất cả', value: 'all' },
                                ...RAM_TYPES.map(type => ({ label: type, value: type }))
                            ]
                        },
                        capacity: {
                            value: selectedCapacity,
                            onChange: handleCapacityFilterChange,
                            options: [
                                { label: 'Tất cả', value: 'all' },
                                ...RAM_CAPACITIES.map(cap => ({ label: `${cap}GB`, value: cap.toString() }))
                            ]
                        },
                        brand: {
                            value: selectedBrand,
                            onChange: handleBrandFilterChange,
                            options: [
                                { label: 'Tất cả', value: 'all' },
                                ...RAM_BRANDS.map(brand => ({ label: brand, value: brand }))
                            ]
                        },
                        search: {
                            value: searchKeyword,
                            onChange: handleSearchChange,
                            placeholder: "Tìm kiếm RAM"
                        },
                        limit: {
                            value: limit,
                            onChange: setLimit,
                            options: [4, 10, 20, 50, 100]
                        }
                    }}
                />
            </div>

            <div className="sticky bottom-0 bg-white border-t z-10">
                {mockApiResponse.data.pagination && (
                    <div className="p-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        onClick={() => handlePageChange(mockApiResponse.data.pagination.currentPage - 1)}
                                        className={mockApiResponse.data.pagination.currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                
                                {[...Array(mockApiResponse.data.pagination.totalPages)].map((_, index) => {
                                    if (index === 0) return (
                                        <PaginationItem key={index}>
                                            <PaginationLink 
                                                onClick={() => handlePageChange(index + 1)}
                                                isActive={mockApiResponse.data.pagination.currentPage === index + 1}
                                            >
                                                {index + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                    
                                    if (
                                        index === mockApiResponse.data.pagination.currentPage - 1 ||
                                        index === mockApiResponse.data.pagination.currentPage - 2 ||
                                        index === mockApiResponse.data.pagination.currentPage
                                    ) return (
                                        <PaginationItem key={index}>
                                            <PaginationLink 
                                                onClick={() => handlePageChange(index + 1)}
                                                isActive={mockApiResponse.data.pagination.currentPage === index + 1}
                                            >
                                                {index + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                    
                                    if (index === mockApiResponse.data.pagination.totalPages - 1) return (
                                        <PaginationItem key={index}>
                                            <PaginationLink 
                                                onClick={() => handlePageChange(index + 1)}
                                                isActive={mockApiResponse.data.pagination.currentPage === index + 1}
                                            >
                                                {index + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                    
                                    if (
                                        index === 1 ||
                                        index === mockApiResponse.data.pagination.totalPages - 2
                                    ) return (
                                        <PaginationItem key={index}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )
                                    
                                    return null
                                })}

                                <PaginationItem>
                                    <PaginationNext 
                                        onClick={() => handlePageChange(mockApiResponse.data.pagination.currentPage + 1)}
                                        className={mockApiResponse.data.pagination.currentPage === mockApiResponse.data.pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {isEditModalOpen && selectedRam && (
                <EditRamModal
                    ram={selectedRam}
                    onUpdate={handleUpdate}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Page;
