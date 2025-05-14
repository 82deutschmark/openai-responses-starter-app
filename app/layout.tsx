// This file defines the root layout for the Next.js application.
// It sets up global styles, fonts, and metadata.
// The AdSense script is also included here to enable monetization across all pages.
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from 'next/script';
import "./globals.css";
// import { SessionProvider } from "next-auth/react"; // No longer directly used here
import SessionProviderWrapper from "./session-provider-wrapper"; // Import the new wrapper

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Mark's gpt-4.1",
  description: "Iteration of the OpenAI Responses API",
  icons: {
    icon: "/gptpluspro.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProviderWrapper>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6692143545933427"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
          <div className="flex h-screen bg-gray-200 w-full flex-col  text-stone-900">
            <main>{children}</main>
          </div>
        </body>
      </SessionProviderWrapper>
    </html>
  );
}
