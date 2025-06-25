import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlashMaster - Advanced Flashcard App",
  description:
    "An innovative flashcard application for effective learning and memorization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="pt-0">
              <div>
                <header className="">
                  <div className="container flex h-[52px] items-start px-4 sm:px-6">
                    <div className="flex md:hidden items-center gap-2 font-bold text-xl border mt-3 pl-2 pr-4 py-1 rounded-md">
                      <SidebarTrigger className="p-4" />
                      <div>
                        <span className="text-primary">Flash</span>
                        <span>Master</span>
                      </div>
                    </div>
                  </div>
                </header>
                <div className="mt-4">{children}</div>
              </div>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
