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
      <body className="bg-radial-gradient text-white min-h-screen text-4xl relative">
        {/* Top Sticky Banner with Industrial Mesh */}
        <div className="sticky-banner top-0 w-full py-4 industrial-mesh">
          <div className="max-w-7xl mx-auto px-4">
            <Navigation />
          </div>
        </div>
        
        {/* Main Content */}
        <main className="relative z-10">
          {children}
        </main>
        
        {/* Bottom Sticky Banner with Industrial Mesh */}
        <div className="sticky-banner-bottom w-full py-4 industrial-mesh">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-2xl text-gray-500">ATOMIC ENGINE • CO-EXECUTIVE INTELLIGENCE SYSTEM</p>
          </div>
        </div>
      </body>
    </html>
  );
}
