import type { Metadata } from "next";
import { Nunito, Geist_Mono } from "next/font/google";
import "./globals.css";

// Nunito: huruf utama yang ramah, bulat, dan konsisten di seluruh aplikasi PELITA (PANDUAN bagian 13).
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PELITA — Cahaya Belajar, Tetap Menyala",
  description:
    "Platform belajar adaptif berbasis AI untuk anak SD dengan penyakit kronis yang menyesuaikan kondisi kesehatan harian dan menjembatani progres kembali ke sekolah asal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${nunito.variable} ${geistMono.variable} h-full scroll-smooth antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-krem text-teks font-sans">{children}</body>
    </html>
  );
}
