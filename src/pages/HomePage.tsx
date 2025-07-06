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
      <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ProductList defaultCategory="all" searchQuery={searchQuery} />
      <WhatsAppButton />
    </MainLayout>
  );
};

export default HomePage;
