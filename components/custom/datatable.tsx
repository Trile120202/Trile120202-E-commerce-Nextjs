import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { FaSearch } from 'react-icons/fa'

interface DataTableProps<T> {
    data: T[];
    columns: {
        accessor: string;
        label: string;
        className?: string;
        render?: (row: T) => React.ReactNode;
    }[];
    loading?: boolean;
    error?: Error | null;
    filters?: {
        status?: {
            value: string;
            onChange: (value: string) => void;
            options: { label: string; value: string }[];
        };
        search?: {
            value: string;
            onChange: (value: string) => void;
            placeholder?: string;
        };
        limit?: {
            value: number;
            onChange: (value: number) => void;
            options: number[];
        };
    };
}

const DataTable = <T extends object>({
                                         data,
                                         columns,
                                         loading,
                                         error,
                                         filters
                                     }: DataTableProps<T>) => {
    // @ts-ignore
    return (
        <Card className="rounded-none shadow-none border-0">
            {filters && (
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {filters.status && (
                            <div className="w-full md:w-auto">
                                <Select
                                    onValueChange={filters.status.onChange}
                                    defaultValue={filters.status.value}
                                >
                                    <SelectTrigger className="w-full md:w-[200px] border-2 border-gray-300 rounded-lg">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filters.status.options.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {filters.search && (
                            <div className="relative w-full md:w-64">
                                <Input
                                    placeholder={filters.search.placeholder || "Tìm kiếm..."}
                                    value={filters.search.value}
                                    onChange={(e) => filters.search?.onChange(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        )}

                        {filters.limit && (
                            <div className="w-full md:w-auto">
                                <Select
                                    onValueChange={(value) => filters.limit?.onChange(Number(value))}
                                    defaultValue={filters.limit.value.toString()}
                                >
                                    <SelectTrigger className="w-full md:w-[150px] border-2 border-gray-300 rounded-lg">
                                        <SelectValue placeholder="Số lượng hiển thị" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filters.limit.options.map((value) => (
                                            <SelectItem key={value} value={value.toString()}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </CardContent>
            )}

            <CardContent className="p-4 md:p-6">
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader className="sticky top-0 bg-white">
                            <TableRow>
                                {columns.map((col, index) => (
                                    <TableHead key={index} className={`${col.className} py-3 text-sm md:text-base bg-gray-100`}>
                                        {col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="overflow-y-auto">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center py-4">
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center py-4 text-red-500">
                                        Đã xảy ra lỗi khi tải dữ liệu.
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center py-4">
                                        Không có dữ liệu.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((row, index) => (
                                    <TableRow key={index} className="hover:bg-gray-50 transition duration-150">
                                        {columns.map((col, colIndex) => (
                                            <TableCell
                                                key={colIndex}
                                                className={`${col.className} py-4 text-sm md:text-base`}
                                            >
                                                {col.render ? col.render(row) : row[col.accessor as keyof typeof row]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default DataTable;