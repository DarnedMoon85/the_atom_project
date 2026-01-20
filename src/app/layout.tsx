import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Atomic Engine",
  description: "Co-Executive Intelligence System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-white min-h-screen text-4xl">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
