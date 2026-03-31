import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mansaha",
  description: "AI assistant by AtlasFlux",
  icons: {
    icon: "/mansahaicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-[#fdfdfd] text-[#0d0d0d]`}
      >
        {children}
      </body>
    </html>
  );
}
