// app/layout.tsx

import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import SessionProviderWrapper from "./SessionProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// ✅ ADVANCED SEO METADATA
export const metadata: Metadata = {
  metadataBase: new URL("https://nono.co.tz"),

  title: {
    default: "Nono Online Shop | Kariakoo Electronics & Accessories",
    template: "%s | Nono Shop",
  },

  description:
    "Buy electronics, accessories, and trending products from Kariakoo. Fast delivery across Tanzania. Trusted online shop like KariakooMall & MyKariakoo.",

  keywords: [
    "Kariakoo online shop",
    "Nono shop Tanzania",
    "MyKariakoo",
    "KariakooMall",
    "electronics Tanzania",
    "buy phones Dar es Salaam",
    "laptops Kariakoo",
    "cheap accessories Tanzania",
  ],

  authors: [{ name: "Nono Shop" }],
  creator: "Nono Shop",
  publisher: "Nono Shop",

  openGraph: {
    type: "website",
    url: "https://nono.co.tz",
    title: "Nono Online Shop - Kariakoo Deals",
    description:
      "Best Kariakoo deals on electronics, accessories & more. Shop online with fast delivery in Tanzania.",
    siteName: "Nono Shop",
    images: [
      {
        url: "/og-image.jpg", // 👉 add this image in public folder
        width: 1200,
        height: 630,
        alt: "Nono Online Shop",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Nono Online Shop",
    description:
      "Shop Kariakoo electronics & accessories online in Tanzania.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://nono.co.tz",
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        
        {/* ✅ STRUCTURED DATA (BETTER FOR GOOGLE RANKING) */}
        <Script
          id="schema-org"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Nono Online Shop",
                url: "https://nono.co.tz",
                logo: "https://nono.co.tz/logo.png",
                sameAs: [
                  "https://facebook.com/kariakooplus",
                  "https://instagram.com/kariakooplus",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                url: "https://nono.co.tz",
                name: "Nono Shop",
                potentialAction: {
                  "@type": "SearchAction",
                  target: "https://nono.co.tz/search?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />

        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}