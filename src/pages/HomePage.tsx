"use client";

import React, { useState } from "react";
import MainLayout from "../components/MainLayout";
import HeroSection from "../components/partial/HeroSection";
import ProductList from "../components/products/ProductList";
import WhatsAppButton from "../components/Buttons/WhatsAppButton";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <MainLayout>
      {/* SEO Meta Tags */}
      <head>
        <title>Home | Your E-Commerce Platform</title>
        <meta name="description" content="Find amazing products for all your needs. Browse our catalog now!" />
        <meta property="og:title" content="Home | kariakooplus Platform" />
        <meta property="og:description" content="Explore a wide range of products. Free delivery on selected items!" />
        <meta property="og:image" content="/images/hero-banner.jpg" />
        <meta property="og:url" content="https://kariakooplus.shop" />
      </head>

      <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      {/* Product List with search feature */}
      <ProductList defaultCategory="all" searchQuery={searchQuery} />

      {/* WhatsApp button for easy communication */}
      <WhatsAppButton />
    </MainLayout>
  );
};

export default HomePage;
