'use client';

import { useState, useEffect } from "react";
import { CartProvider } from "../context/CartContext";
import { ThemeProvider } from "./ThemeProvider";
import { LanguageProvider } from "../context/LanguageContext";
import ChocolatePreloader from "./ChocolatePreloader";
import { Toaster } from "react-hot-toast";
import ConditionalLayout from "./ConditionalLayout";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render children until preloader is complete
  if (!isMounted) {
    return null;
  }

  return (
    <LanguageProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <CartProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#4A3728',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <ChocolatePreloader onComplete={() => setIsPreloaderComplete(true)} />
          <div style={{ 
            opacity: isPreloaderComplete ? 1 : 0,
            visibility: isPreloaderComplete ? 'visible' : 'hidden',
            transition: 'opacity 0.3s ease-in-out'
          }}>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </div>
        </CartProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
