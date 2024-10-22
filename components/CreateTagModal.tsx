import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { FaPlus } from 'react-icons/fa';
import useApi from '@/lib/useApi';
import { useToast } from "@/hooks/use-toast"


interface Tag {
    id: number;
    name: string;
    status: number;
}

export const CreateTagModal = ({ onCreate }: { onCreate: (newTag: Tag) => void }) => {
    const [tagName, setTagName] = useState('');
    const [tagStatus, setTagStatus] = useState<string>('1');
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const { data, loading, error, fetchData } = useApi<{ data: Tag }>('/api/tag', {
        method: 'POST',
        body: { name: tagName, status: Number(tagStatus) }
    });

    useEffect(() => {
        if (data) {
            onCreate(data.data);
            toast({
                title: "Thành công",
                description: "Tạo từ khóa thành công!",
            });
            setTagName('');
            setTagStatus('1');
            setOpen(false);
        }
        if (error) {
            toast({
                title: "Lỗi",
                description: 'Không thể tạo từ khóa',
                variant: "destructive",
            });
        }
    }, [data, error, onCreate, toast]);

    const handleSubmit = async () => {
        if (!tagName.trim()) {
            toast({
                title: "Lỗi",
                description: "Tên từ khóa không được để trống",
                variant: "destructive",
            });
            return;
        }

        fetchData();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600 transition duration-300">
                    <FaPlus className="mr-2 h-4 w-4" />
                    Tạo mới từ khóa
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Tạo mới từ khóa</DialogTitle>
                <div className="flex flex-col space-y-4">
                    <Input
                        placeholder="Tên từ khóa"
                        value={tagName}
                        onChange={(e) => setTagName(e.target.value)}
                    />
                    <Select onValueChange={setTagStatus} defaultValue={tagStatus}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Hoạt động</SelectItem>
                            <SelectItem value="0">Không hoạt động</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="mt-6">
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Đang tạo...' : 'Tạo mới'}
                    </Button>
                </div>
                <DialogClose />
            </DialogContent>
        </Dialog>
    );
};
