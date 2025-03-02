import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { AuthProvider } from "./components/providers";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CourseSync",
  description: "An application that allows you to sync your courses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-gray-950 text-gray-200 min-h-screen`}
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
