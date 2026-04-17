"use client";

import React, { ReactNode } from 'react';
import { AuthProvider } from '../src/contexts/AuthContext';
import { CartProvider } from '../src/contexts/CartContext';
import { AdminLanguageProvider } from '../src/contexts/AdminLanguageContext';
import { usePathname } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { useScrollReveal } from '../src/hooks/useScrollReveal';

export function Providers({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');
    const contentRef = React.useRef<HTMLDivElement>(null);

    useScrollReveal(contentRef, pathname);

    return (
        <AuthProvider>
            <CartProvider>
                <AdminLanguageProvider>
                    <div className="min-h-screen selection:bg-primary/20 selection:text-primary overflow-x-hidden" ref={contentRef}>
                        {!isAdminRoute && <Navbar />}
                        <main className="transition-all duration-700 min-h-screen">
                            {children}
                        </main>
                        {!isAdminRoute && <Footer />}
                        <ChatWidget />
                    </div>
                </AdminLanguageProvider>
            </CartProvider>
        </AuthProvider>
    );
}
