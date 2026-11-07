import type { Metadata } from "next";
<<<<<<< HEAD
import { Geist, Geist_Mono, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
=======
import { Nunito } from "next/font/google";
>>>>>>> f178466816c828d30a3e039f2d29ed7fc8613079
import "./globals.css";

// Nunito: huruf bulat yang ramah anak, dipakai untuk judul dan isi (PANDUAN bagian 13).
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PELITA — Cahaya Belajar, Tetap Menyala",
  description:
    "Platform belajar adaptif berbasis AI untuk anak SD dengan penyakit kronis yang menyesuaikan kondisi kesehatan harian dan menjembatani progres kembali ke sekolah asal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
<<<<<<< HEAD
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${plusJakarta.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FFFBF4] text-[#4A1520]">{children}</body>
=======
    <html lang="id" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
>>>>>>> f178466816c828d30a3e039f2d29ed7fc8613079
    </html>
  );
}
