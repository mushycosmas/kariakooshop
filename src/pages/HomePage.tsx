// pages/home.tsx or your HomePage component
"use client";

import React, { useState } from "react";
import MainLayout from "../components/MainLayout";
import HeroSection from "../components/partial/HeroSection";
import ProductList from "../components/products/ProductList";
import WhatsAppButton from "../components/Buttons/WhatsAppButton";
import Head from "next/head";  // Import Next.js Head component

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <MainLayout>
      <Head>
        {/* SEO Meta Tags */}
        <title>Home | Your E-Commerce Platform</title>
        <meta
          name="description"
          content="Find amazing products for all your needs. Browse our catalog now!"
        />
        <meta property="og:title" content="Home | kariakooplus Platform" />
        <meta
          property="og:description"
          content="Explore a wide range of products. Free delivery on selected items!"
        />
        <meta property="og:image" content="/images/hero-banner.jpg" />
        <meta property="og:url" content="https://kariakooplus.shop" />
      </Head>

      {/* Rest of the page content */}
      <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ProductList defaultCategory="all" searchQuery={searchQuery} />
      <WhatsAppButton />
    </MainLayout>
  );
};

export default HomePage;
