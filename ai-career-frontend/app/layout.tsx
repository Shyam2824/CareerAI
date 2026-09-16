import type { Metadata } from "next";
import "./globals.css";

import Providers from "@/context/Providers";

export const metadata: Metadata = {
  title: "CareerAI",
  description: "AI Powered Career Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}