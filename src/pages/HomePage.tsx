"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import HeroSection from "../components/partial/HeroSection";
import ProductList from "../components/products/ProductList";
import WhatsAppButton from "../components/Buttons/WhatsAppButton";

// ✅ Declare a proper Category interface
interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

const Home = () => {
  // ✅ Tell useState the type is Category[]
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const data: Category[] = await res.json(); // ✅ tell TypeScript what the response is
        setCategories([{ id: "all", name: "All", subcategories: [] }, ...data]);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }
    loadCategories();
  }, []);

  return (
    <MainLayout>
      <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ProductList category={selectedCategoryId} searchQuery={searchQuery} />
      <WhatsAppButton />
    </MainLayout>
  );
};

export default Home;
