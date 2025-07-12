"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import ProductCard from "./ProductCard";
import CategorySidebar from "../partial/CategorySidebar";
import { Product } from "../../types/Product";

interface ProductListProps {
  defaultCategory?: string;
  searchQuery?: string;
}

const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const ProductList: React.FC<ProductListProps> = ({
  defaultCategory = "all",
  searchQuery = "",
}) => {
  const [subcategoryId, setSubcategoryId] = useState(defaultCategory);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load subcategory from localStorage on first render
  useEffect(() => {
    const savedSubcategory = localStorage.getItem("subcategoryId");
    if (savedSubcategory) {
      setSubcategoryId(savedSubcategory);
    }
  }, []);

  // Save subcategory selection to localStorage
  useEffect(() => {
    localStorage.setItem("subcategoryId", subcategoryId);
  }, [subcategoryId]);

  // Fetch products from API or cache
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    const cacheKey = `products_${subcategoryId}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const now = Date.now();

        if (
          parsed &&
          parsed.data &&
          parsed.timestamp &&
          now - parsed.timestamp < CACHE_DURATION_MS
        ) {
          setProducts(parsed.data);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem(cacheKey);
        }
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    try {
      const url = new URL("/api/ads/all", window.location.origin);
      if (subcategoryId.toLowerCase() !== "all") {
        url.searchParams.append("subcategory_id", subcategoryId);
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      const fetchedProducts = data.products || [];

      setProducts(fetchedProducts);

      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: fetchedProducts,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError((err as Error).message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when subcategory changes
  useEffect(() => {
    fetchProducts();
  }, [subcategoryId]);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchQuery]);

  return (
    <Container fluid className="mt-4">
      <Row>
        {/* Sidebar */}
        <Col xs={12} md={3} lg={3} className="mb-4">
          <CategorySidebar onSubcategorySelect={setSubcategoryId} />
        </Col>

        {/* Product Grid */}
        <Col xs={12} md={9} lg={9}>
          {loading && (
            <div className="text-center my-4">
              <Spinner animation="border" />
            </div>
          )}

          {error && <p className="text-danger text-center">{error}</p>}

          {!loading && !error && filteredProducts.length === 0 && (
            <p className="text-center">No products found.</p>
          )}

          {/* Product Cards */}
          <Row>
            {filteredProducts.map((product) => (
              <Col key={product.id} xs={12} sm={6} md={3} className="mb-4">
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
      
    </Container>
  );
};

export default ProductList;
