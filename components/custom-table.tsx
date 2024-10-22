import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface Column {
    accessor: string;
    label: string;
    className?: string;
}

interface DataRow {
    [key: string]: any;
}

interface CustomTableProps {
    data: DataRow[];
    columns: Column[];
    caption?: string;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function CustomTable({ data, columns, caption, currentPage, totalPages, onPageChange }: CustomTableProps) {
    return (
        <>
            <Table>
                <TableCaption>{caption || "Data Table"}</TableCaption>
                <TableHeader>
                    <TableRow>
                        {columns.map((col, index) => (
                            <TableHead key={index} className={col.className}>
                                {col.label}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow key={index}>
                            {columns.map((col, colIndex) => (
                                <TableCell 
                                    key={colIndex} 
                                    className={col.className}
                                >
                                    {row[col.accessor]}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious 
                            onClick={() => onPageChange(currentPage - 1)} 
                            aria-disabled={currentPage === 1} 
                        />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, index) => (
                        <PaginationItem key={index}>
                            <PaginationLink 
                                onClick={() => onPageChange(index + 1)}
                                isActive={currentPage === index + 1}
                            >
                                {index + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext 
                            onClick={() => onPageChange(currentPage + 1)} 
                            aria-disabled={currentPage === totalPages} 
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </>
    );
}
