"use client";

import * as React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Status } from "@/lib/configs/enum.status";

interface SelectStatusProps {
    value?: Status;
    onValueChange?: (value: Status) => void;
    disabled?: boolean;
    options?: "basic" | "full";
}

const SelectStatus: React.FC<SelectStatusProps> = ({
    value,
    onValueChange,
    disabled = false,
    options = "full"
}) => {
    return (
        <Select
            value={value?.toString()}
            onValueChange={(value) => onValueChange?.(Number(value) as Status)}
            disabled={disabled}
        >
            <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
                {options === "basic" ? (
                    <>
                        <SelectItem value={Status.INACTIVE.toString()}>Không hoạt động</SelectItem>
                        <SelectItem value={Status.ACTIVE.toString()}>Hoạt động</SelectItem>
                    </>
                ) : (
                    <>
                        <SelectItem value={Status.DELETED.toString()}>Đã xóa</SelectItem>
                        <SelectItem value={Status.BANNED.toString()}>Đã cấm</SelectItem>
                        <SelectItem value={Status.INACTIVE.toString()}>Không hoạt động</SelectItem>
                        <SelectItem value={Status.ACTIVE.toString()}>Hoạt động</SelectItem>
                        <SelectItem value={Status.PENDING.toString()}>Đang chờ</SelectItem>
                        <SelectItem value={Status.PROCESSING.toString()}>Đang xử lý</SelectItem>
                        <SelectItem value={Status.COMPLETED.toString()}>Hoàn thành</SelectItem>
                        <SelectItem value={Status.CANCELLED.toString()}>Đã hủy</SelectItem>
                        <SelectItem value={Status.RETURNED.toString()}>Đã trả lại</SelectItem>
                    </>
                )}
            </SelectContent>
        </Select>
    );
};

export default SelectStatus;
