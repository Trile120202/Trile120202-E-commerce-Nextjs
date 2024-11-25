"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { useGetDataSetting } from '@/hooks/useGetDataSetting';

const ContactPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const { data: contact_address } = useGetDataSetting('contact_address');
    const { data: contact_phone } = useGetDataSetting('contact_phone'); 
    const { data: contact_email } = useGetDataSetting('contact_email'); 
    const { data: contact_time } = useGetDataSetting('contact_time');
    const { data: contact_map_url } = useGetDataSetting('contact_map_url');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', { name, email, subject, message });
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 py-16 md:py-24">
                <motion.h1 
                    className="text-4xl md:text-5xl font-bold mb-8 md:mb-12 text-center text-blue-800"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Liên hệ với chúng tôi
                </motion.h1>

                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="p-8 md:p-12 bg-blue-700 text-white"
                        >
                            <h2 className="text-2xl md:text-3xl font-semibold mb-6">Thông tin liên hệ</h2>
                            <div className="space-y-6 mb-8">
                                <p className="flex items-center">
                                    <FaEnvelope className="mr-4 text-2xl text-yellow-300" />
                                    {contact_email}
                                </p>
                                    <p className="flex items-center">
                                        <FaPhone className="mr-4 text-2xl text-yellow-300" />
                                        {contact_phone}
                                    </p>
                                <p className="flex items-start">
                                    <FaMapMarkerAlt className="mr-4 mt-1 text-2xl text-yellow-300 flex-shrink-0" />
                                    {contact_address}
                                </p>
                                <p className="flex items-center">
                                    <FaClock className="mr-4 text-2xl text-yellow-300" />
                                    {contact_time}
                                </p>
                            </div>
                            <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden mb-8">
                                <iframe 
                                    src={contact_map_url} 
                                    width="100%" 
                                    height="100%" 
                                    style={{border:0}} 
                                    allowFullScreen={true} 
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </motion.div>

                        <motion.form
                            onSubmit={handleSubmit}
                            className="p-8 md:p-12 space-y-6"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <div>
                                <label htmlFor="name" className="block mb-2 font-semibold text-gray-700">Họ tên</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block mb-2 font-semibold text-gray-700">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block mb-2 font-semibold text-gray-700">Chủ đề</label>
                                <input
                                    type="text"
                                    id="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block mb-2 font-semibold text-gray-700">Tin nhắn</label>
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300"
                                    required
                                ></textarea>
                            </div>
                            <motion.button
                                type="submit"
                                className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300 font-semibold"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Gửi tin nhắn
                            </motion.button>
                        </motion.form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
