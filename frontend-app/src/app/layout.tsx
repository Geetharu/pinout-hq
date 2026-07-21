import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PinoutHQ | Autonomous Hardware Hub & Telemetry Matrix",
  description: "Enterprise data aggregation, GPIO pinout multiplexers, and real time specification matrix for developers, embedded engineers, and IoT makers.",
  keywords: ["Pinout", "ESP32", "Arduino", "Raspberry Pi", "Microcontroller", "GPIO", "Hardware Matrix", "IoT"],
  authors: [{ name: "PinoutHQ Editorial Team" }],
  openGraph: {
    title: "PinoutHQ | Autonomous Hardware Hub & Telemetry Matrix",
    description: "Real time specification matrix and GPIO pinout multiplexers for modern hardware modules.",
    url: "https://www.pinouthq.com",
    siteName: "PinoutHQ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}