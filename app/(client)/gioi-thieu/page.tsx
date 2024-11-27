"use client"
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView, useAnimation } from 'framer-motion';
import { FaShieldAlt, FaHandshake, FaHeadset, FaMapMarkerAlt } from 'react-icons/fa';
import {useGetDataSetting} from "@/hooks/useGetDataSetting";

const AnimatedSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-100px" });
    const controls = useAnimation();
    const { data: contact_address } = useGetDataSetting('contact_address');
    useEffect(() => {
        if (isInView) {
            controls.start({ opacity: 1, y: 0 });
        } else {
            controls.start({ opacity: 0, y: 50 });
        }
    }, [isInView, controls]);

    return (
        <motion.section
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            transition={{ duration: 0.5, delay }}
        >
            {children}
        </motion.section>
    );
};

const Page: React.FC = () => {
    const titleControls = useAnimation();
    const titleRef = useRef(null);
    const isTitleInView = useInView(titleRef, { once: false });
    const { data: contact_address } = useGetDataSetting('contact_address');
    const { data: contact_phone } = useGetDataSetting('contact_phone');

    useEffect(() => {
        if (isTitleInView) {
            titleControls.start({ opacity: 1, y: 0 });
        } else {
            titleControls.start({ opacity: 0, y: -50 });
        }
    }, [isTitleInView, titleControls]);

    return (
        <div className="container mx-auto px-4 py-8 text-gray-800">
            <motion.h1 
                ref={titleRef}
                className="text-5xl h-[60px] font-bold mb-10 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
                initial={{ opacity: 0, y: -50 }}
                animate={titleControls}
                transition={{ duration: 0.5 }}
            >
                Về chúng tôi
            </motion.h1>
            
            <AnimatedSection delay={0.2}>
                <div className="mb-12 p-6 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-6 md:mb-0 md:mr-6">
                            <Image
                                src="/images/anh1a.avif"
                                alt="About Us"
                                width={500}
                                height={500}
                                className="rounded-lg shadow-lg"
                            />
                        </div>
                        <div className="md:w-1/2">
                            <h2 className="text-3xl font-semibold mb-4 text-blue-800">Chào mừng đến với cửa hàng laptop uy tín hàng đầu Việt Nam</h2>
                            <p className="mb-4 text-gray-700">
                                Chúng tôi tự hào là đơn vị cung cấp laptop chất lượng cao, đáp ứng mọi nhu cầu của khách hàng từ học tập, làm việc đến giải trí.
                            </p>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
                <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-lg bg-gradient-to-br from-green-100 to-blue-100">
                        <h2 className="text-2xl font-semibold mb-4 flex items-center text-green-800">
                            <FaShieldAlt className="mr-2" />
                            Cam kết của chúng tôi
                        </h2>
                        <ul className="list-disc list-inside text-gray-700">
                            <li>Sản phẩm chính hãng, chất lượng đảm bảo chất lượng</li>
                            <li>Dịch vụ hậu mãi chu đáo</li>
                            <li>Tư vấn chuyên nghiệp, tận tâm</li>
                            <li>Giá cả cạnh tranh</li>
                        </ul>
                    </div>
                    <div className="p-6 rounded-lg bg-gradient-to-br from-yellow-100 to-red-100">
                        <h2 className="text-2xl font-semibold mb-4 flex items-center text-yellow-800">
                            <FaHandshake className="mr-2" />
                            Giá trị cốt lõi
                        </h2>
                        <ul className="list-disc list-inside text-gray-700">
                            <li>Uy tín là hàng đầu</li>
                            <li>Chất lượng là trọng tâm</li>
                            <li>Khách hàng là ưu tiên số một</li>
                            <li>Đổi mới và phát triển không ngừng</li>
                        </ul>
                    </div>
                </div>
            </AnimatedSection>

            <AnimatedSection delay={0.6}>
                <div className="mb-12 p-6 rounded-lg bg-gradient-to-br from-pink-100 to-orange-100">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-6 md:mb-0 md:mr-6">
                            <Image
                                src="/images/flat-design-realistic-landing-page-template_23-2150102697.avif"
                                alt="Customer Service"
                                width={500}
                                height={500}
                                className="rounded-lg shadow-lg"
                            />
                        </div>
                        <div className="md:w-1/2">
                            <h2 className="text-2xl font-semibold mb-4 flex items-center text-pink-800">
                                <FaHeadset className="mr-2" />
                                Dịch vụ khách hàng
                            </h2>
                            <p className="text-gray-700">
                                Chúng tôi cam kết mang đến trải nghiệm mua sắm tuyệt vời nhất cho khách hàng. Đội ngũ nhân viên tận tâm của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.
                            </p>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            <AnimatedSection delay={0.8}>
                <div className="p-6 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-6 md:mb-0 md:mr-6">
                            <h2 className="text-2xl font-semibold mb-4 flex items-center text-purple-800">
                                <FaMapMarkerAlt className="mr-2" />
                                Liên hệ với chúng tôi
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Hãy ghé thăm cửa hàng hoặc liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Địa chỉ:</h3>
                                    <p>{contact_address}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Điện thoại:</h3>
                                    <p>{contact_phone}</p>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <Image
                                src="/images/landing-page-with-laptop-template-design_23-2148340933.avif"
                                alt="Contact Us"
                                width={500}
                                height={500}
                                className="rounded-lg shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </AnimatedSection>
        </div>
    );
};

export default Page;