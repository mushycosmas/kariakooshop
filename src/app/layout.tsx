// app/layout.tsx (or wherever your root layout is)

import type { Metadata } from "next";
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import SessionProviderWrapper from "./SessionProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kariakoo Plus Shop",
  description:
    "Shop the best deals on Kariakoo, MyKariakoo, KariakooMall — electronics, accessories, and more with fast delivery and secure shopping from Kariakoo.",
  keywords: [
    "Kariakoo",
    "MyKariakoo",
    "KariakooMall",
    "Kariakoo Plus",
    "Electronics Kariakoo",
    "Kariakoo shopping",
    "MyKariakoo deals",
    "KariakooMall online store",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        {/* Structured Data JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Kariakoo Plus Shop",
              alternateName: "MyKariakoo, KariakooMall",
              url: "https://kariakooplus.shop",
              logo: "https://kariakooplus.shop/logo.png",
              sameAs: [
                "https://facebook.com/kariakooplus",
                "https://twitter.com/kariakooplus",
                // add more official social profiles here
              ],
            }),
          }}
        />
      </Head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
