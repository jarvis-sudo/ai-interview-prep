import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Link from "next/link";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prepwise",
  description:"An AI powered platform for preparing for mock interviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="root-layout">
        <nav>
            <Link href="/" className='flex items-center gap-2'>
            <Image src="/logo.svg" alt='Mockmate logo' width={38} height={32}/>
            <h2 className='text-primary-100'>Prepwise</h2>
            </Link>
        </nav>
        {children}
        <Toaster/>
        </div>
      </body>
    </html>
  );
}
