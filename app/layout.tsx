import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { AuthSyncProvider } from '@/components/auth/auth-sync-provider';
import { Toaster } from 'sonner';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';

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
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Moikas: Signal",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Moikas: Signal",
    title: "Moikas: Signal",
    description: "A minimalist blog platform for gaming, anime, AI, sports, music, and news enthusiasts",
  },
  twitter: {
    card: "summary",
    title: "Moikas: Signal",
    description: "A minimalist blog platform for gaming, anime, AI, sports, music, and news enthusiasts",
  },
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
            <OfflineIndicator />
            {children}
            <InstallPrompt />
          </AuthSyncProvider>
          <Toaster position="top-right" />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
