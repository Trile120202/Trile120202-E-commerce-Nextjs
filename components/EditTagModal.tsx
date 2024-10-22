import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useApi from '@/lib/useApi';

interface Tag {
  id: number;
  name: string;
  status: number;
}

interface EditTagModalProps {
  tag: Tag;
  onUpdate: (updatedTag: Tag) => void;
  onClose: () => void;
}

export const EditTagModal: React.FC<EditTagModalProps> = ({ tag, onUpdate, onClose }) => {
  const [name, setName] = useState(tag.name);
  const [status, setStatus] = useState(tag.status.toString());

  const { data, loading, error, fetchData } = useApi<Tag>(`/api/tag`, {
    method: 'PUT',
    body: { id: tag.id, name, status: parseInt(status) }
  });

  useEffect(() => {
    setName(tag.name);
    setStatus(tag.status.toString());
  }, [tag]);

  useEffect(() => {
    if (data) {
      onUpdate(data);
      onClose();
    }
  }, [data, onUpdate, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa từ khóa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Tên
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Trạng thái
              </Label>
              <Select onValueChange={setStatus} defaultValue={status}>
                <SelectTrigger className="w-full col-span-3">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Hoạt động</SelectItem>
                  <SelectItem value="0">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
