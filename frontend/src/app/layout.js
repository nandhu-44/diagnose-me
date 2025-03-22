import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Diagnose Me - Medical RAG System",
  description: "A healthcare application for structuring and querying medical records",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-background`}
      >
        {children}
      </body>
    </html>
  );
}
