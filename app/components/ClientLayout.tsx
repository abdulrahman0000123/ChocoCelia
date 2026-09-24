'use client';

import { CartProvider } from "../context/CartContext";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "react-hot-toast";
import ConditionalLayout from "./ConditionalLayout";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
        <div>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </div>
      </CartProvider>
    </ThemeProvider>
  );
}
