import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

// Nunito: huruf bulat yang ramah anak, dipakai untuk judul dan isi (PANDUAN bagian 13).
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PELITA",
  description: "Platform belajar adaptif untuk anak SD dengan penyakit kronis",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
