import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Layout = ({
                    children,
                }: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <>
            <Header/>
            <div className={'h-[64px]'}></div>
            {children}
            <Footer/>
        </>
    );
};

export default Layout;
