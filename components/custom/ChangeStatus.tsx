'use client';

import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ChangeStatusProps {
    id: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    endpoint: string;
    status: number;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    successMessage?: string;
    errorMessage?: string;
}

export function ChangeStatus({ 
    id, 
    isOpen, 
    onClose, 
    onSuccess,
    endpoint,
    status,
    title = "Bạn có chắc chắn?",
    description = "Hành động này không thể hoàn tác.",
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    successMessage = "Thay đổi trạng thái thành công",
    errorMessage = "Có lỗi xảy ra khi thay đổi trạng thái"
}: ChangeStatusProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    status
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || errorMessage);
            }

            toast({
                title: "Thành công",
                description: successMessage,
            });

            onSuccess();
        } catch (error) {
            console.error('Error changing status:', error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: (error as Error).message || errorMessage,
            });
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={status === -2 ? "bg-red-500 hover:bg-red-600" : ""}
                    >
                        {isLoading ? "Đang xử lý..." : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}