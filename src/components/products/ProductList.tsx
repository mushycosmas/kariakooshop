"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Button } from "react-bootstrap";
import ProductCard from "./ProductCard";
import CategorySidebar from "../partial/CategorySidebar";
import { Product } from "../../types/Product";

interface ProductListProps {
  defaultCategory?: string;
  searchQuery?: string;
}

const PAGE_SIZE = 12;

const ProductList: React.FC<ProductListProps> = ({
  defaultCategory = "all",
  searchQuery = "",
}) => {
  const [subcategoryId, setSubcategoryId] = useState(defaultCategory);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (pageNumber: number, reset = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL("/api/ads/all", window.location.origin);
      if (subcategoryId.toLowerCase() !== "all") {
        url.searchParams.append("subcategory_id", subcategoryId);
      }
      url.searchParams.append("page", String(pageNumber));
      url.searchParams.append("pageSize", String(PAGE_SIZE));

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      const newProducts = data.products || [];

      setProducts(prev => (reset ? newProducts : [...prev, ...newProducts]));
      setHasMore(newProducts.length === PAGE_SIZE);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Reset when category changes
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [subcategoryId]);

  // Load more when page changes (after first)
  useEffect(() => {
    if (page > 1) {
      fetchProducts(page);
    }
  }, [page]);

  // Filter products by search
  const filteredProducts = searchQuery.trim()
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col xs={12} md={3} lg={3} className="mb-4">
          <CategorySidebar onSubcategorySelect={setSubcategoryId} />
        </Col>

        <Col xs={12} md={9} lg={9}>
          <Row>
            {filteredProducts.map(product => (
              <Col key={product.id} xs={12} sm={6} md={3} className="mb-4">
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>

          {loading && (
            <div className="text-center my-4">
              <Spinner animation="border" />
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <p className="text-center">No products found.</p>
          )}

          {error && <p className="text-danger text-center">{error}</p>}

          {/* Load More Button */}
          {!loading && hasMore && filteredProducts.length > 0 && (
            <div className="text-center my-4">
              <Button onClick={() => setPage(prev => prev + 1)} variant="primary">
                Load More
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductList;
