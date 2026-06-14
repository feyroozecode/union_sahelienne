import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Union Sahélienne — Le mariage, avec sérieux et respect",
  description:
    "La plateforme matrimoniale du Sahel. Des profils vérifiés, un cadre respectueux des valeurs, pour des unions sincères au Mali, Niger, Burkina Faso, Tchad, Mauritanie et Sénégal.",
  keywords: [
    "mariage",
    "matrimonial",
    "Sahel",
    "Mali",
    "Niger",
    "Burkina Faso",
    "union",
  ],
  openGraph: {
    title: "Union Sahélienne",
    description: "La plateforme matrimoniale du Sahel — profils vérifiés, unions sincères.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${hanken.variable}`}>
      <body>{children}</body>
    </html>
  );
}
