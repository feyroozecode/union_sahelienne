import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Union Sahelienne | Admin",
  description: "Administrative Dashboard for Union Sahelienne",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
