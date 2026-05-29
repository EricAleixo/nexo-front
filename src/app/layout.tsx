import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/AuthContext";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Quizzy — Quiz ao Vivo",
  description: "Crie salas de quiz em tempo real com seus amigos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-dm antialiased">
         <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}