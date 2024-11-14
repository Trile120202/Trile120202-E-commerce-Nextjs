'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Loading from '@/components/Loading';

const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    return await response.json();
};

const Page = () => {
    const { data, error } = useSWR('/api/auth/profile', fetcher);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [roleName, setRoleName] = useState('');
    const { toast } = useToast(); 

    useEffect(() => {
        if (data) {
            setFullName(data.user.fullName);
            setEmail(data.user.email);
            setRoleName(data.user.roleName);
        }
    }, [data]);

    if (error) return <div>Failed to load</div>;
    if (!data) return <Loading />;
    const { user } = data;

    const handleSave = async () => {
        try {
            const response = await fetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            toast({
                title: "Success",
                description: "Profile updated successfully!",
                duration: 9000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: "Error",
                description: "Failed to update profile",
                duration: 9000,
                isClosable: true,
            });
        }
    };

    return (
        <div className="container mx-auto px-4 pt-10">
            <div className="flex flex-col items-center justify-center">
                {/* <img src="/profile-picture.png" alt="Profile Picture" className="w-32 h-32 rounded-full mb-4" /> */}
                <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="mb-4 p-2 border border-gray-300 rounded"
                />
                <input
                    type="email"
                    value={email}
                    disabled
                    placeholder="Email"
                    className="mb-4 p-2 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    value={roleName}
                    disabled
                    placeholder="Role"
                    className="mb-4 p-2 border border-gray-300 rounded"
                />
                <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Lưu thay đổi
                </button>
            </div>
        </div>
    );
};

export default Page;