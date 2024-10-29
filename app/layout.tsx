import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {Toaster} from "@/components/ui/toaster"

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Z-Shop",
    description: "Welcome to Z-Shop",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={`${inter.className} bg-gray-100`}>
        <main>{children}</main>
        <Toaster/>
        </body>
        </html>
    );
}
