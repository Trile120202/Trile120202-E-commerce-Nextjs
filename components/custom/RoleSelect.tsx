"use client";

import React, { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

interface Role {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    status: number;
}

interface RoleSelectProps {
    control: any;
    name: string;
    label?: string;
    placeholder?: string;
    className?: string;
}

const RoleSelect = ({
    control,
    name,
    label = "Vai trò",
    placeholder = "Chọn vai trò",
    className
}: RoleSelectProps) => {
    const [roles, setRoles] = useState<Role[]>([]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch('/api/role/get-all-role');
                if (response.ok) {
                    const result = await response.json();
                    if (result.status === 200) {
                        setRoles(result.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };
        fetchRoles();
    }, []);

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className={`h-10 lg:h-12 text-base lg:text-lg ${className}`}>
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default RoleSelect;
