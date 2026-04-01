import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "@/context/ChatContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mansaha AI",
  description: "AI assistant by AtlasFlux",
  icons: {
    icon: "/mansahaicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.className} antialiased bg-[#fdfdfd] text-[#0d0d0d]`}
        >
          <ChatProvider>{children}</ChatProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
