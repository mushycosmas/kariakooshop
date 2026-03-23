"use client";

import React, { useState } from "react";
import MainLayout from "../components/MainLayout";
import HeroSection from "../components/partial/HeroSection";
import ProductList from "../components/products/ProductList";
import WhatsAppButton from "../components/Buttons/WhatsAppButton";
import Head from "next/head";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <MainLayout>
      <Head>
        {/* 🔥 PRIMARY SEO */}
        <title>
          Nono Tanzania | Kariakoo Online Market - Buy & Sell Products
        </title>

        <meta
          name="description"
          content="Nono is your online Kariakoo marketplace in Tanzania. Buy and sell electronics, fashion, accessories and more at the best prices."
        />

        {/* 🔥 KEYWORDS BOOST */}
        <meta
          name="keywords"
          content="nono, kariakoo online, kariakoo market, Tanzania ecommerce, buy online Tanzania, sell products Tanzania"
        />

        {/* 🔥 OPEN GRAPH */}
        <meta
          property="og:title"
          content="Nono | Kariakoo Online Shopping Platform"
        />
        <meta
          property="og:description"
          content="Shop from Kariakoo online with NONO. Discover deals on electronics, fashion, and more in Tanzania."
        />
        <meta property="og:image" content="/images/hero-banner.jpg" />
        <meta property="og:url" content="https://nono.co.tz" />

        {/* 🔥 BRAND TRANSITION SIGNAL */}
        <meta
          name="author"
          content="Nono (Inspired by Kariakoo Market Tanzania)"
        />
      </Head>

      {/* Page Content */}
      <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ProductList defaultCategory="all" searchQuery={searchQuery} />
      <WhatsAppButton />
    </MainLayout>
  );
};

export default HomePage;