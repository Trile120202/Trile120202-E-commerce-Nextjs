"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const ContactPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here
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
                                    <span className="break-all">contact@zshop.com</span>
                                </p>
                                <p className="flex items-center">
                                    <FaPhone className="mr-4 text-2xl text-yellow-300" />
                                    (028) 3456-7890
                                </p>
                                <p className="flex items-start">
                                    <FaMapMarkerAlt className="mr-4 mt-1 text-2xl text-yellow-300 flex-shrink-0" />
                                    <span>1227 Huỳnh Tấn Phát, Phú Mỹ, Quận 7, TP. Hồ Chí Minh</span>
                                </p>
                                <p className="flex items-center">
                                    <FaClock className="mr-4 text-2xl text-yellow-300" />
                                    8:00 - 22:00 (Thứ 2 - Chủ Nhật)
                                </p>
                            </div>
                            <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden mb-8">
                                <iframe 
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.1824747869655!2d106.73416937601239!3d10.720404860222542!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752542eaa64631%3A0x18c3217255a019e5!2zMTIyNyBIdeG7s25oIFThuqVuIFBow6F0LCBQaMO6IE3hu7ksIFF14bqtbiA3LCBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1729412101091!5m2!1svi!2s" 
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
