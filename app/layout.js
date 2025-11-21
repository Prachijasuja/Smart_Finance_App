"use client"; // ← important

import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "../components/header";
import Toaster from "../components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
  <Header />
  <main className="min-h-screen">{children}</main>
  <Toaster richColors />
  <footer className="bg-blue-50 py-12 text-center text-gray-600">
    Made with ❤️ by Prachi
  </footer>
</ClerkProvider>

      </body>
    </html>
  );
}
