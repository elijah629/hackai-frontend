import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Analytics } from "@vercel/analytics/next";

const phantomSans = localFont({
  src: [
    {
      path: "../fonts/Italic.woff2",
      style: "italic",
      weight: "normal",
    },
    {
      path: "../fonts/Bold.woff2",
      style: "normal",
      weight: "bold",
    },
    {
      path: "../fonts/Regular.woff2",
      style: "normal",
      weight: "normal",
    },
  ],
  variable: "--font-phantom-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hackclub AI",
  description: "powered by hackai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${phantomSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="h-screen min-w-0">
              <Header />
              {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
