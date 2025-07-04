'use client';

import React, { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import HeroSection from "../components/partial/HeroSection";
import { Container } from "react-bootstrap";
import ProductList from "../components/products/ProductList";
import WhatsAppButton from "../components/Buttons/WhatsAppButton";
// import CategoryPills from "../components/products/CategoryPills";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // 👈 Add this

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
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
