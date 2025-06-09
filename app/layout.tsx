import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { AuthSyncProvider } from '@/components/auth/auth-sync-provider';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moikas: Signal - Tech & Digital Culture Blog",
  description: "A minimalist blog platform for gaming, anime, AI, sports, music, and news enthusiasts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <AuthSyncProvider>
            {children}
          </AuthSyncProvider>
          <Toaster position="top-right" />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
