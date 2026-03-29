import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TounsiPro Admin",
  description: "Dashboard administration TounsiPro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
