"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container, Row, Col, Spinner, Button } from "react-bootstrap";
import ProductCard from "./ProductCard";
import CategorySidebar from "../partial/CategorySidebar";
import { Product } from "../../types/Product";

interface ProductListProps {
  defaultCategory?: string;
  searchQuery?: string;
}

const PAGE_SIZE = 12;
const FOOTER_HEIGHT_PX = 200;

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

  const loaderRef = useRef<HTMLDivElement | null>(null);

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
      url.searchParams.append("_", Date.now().toString()); // 💥 cache buster

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      const newProducts = data.products || [];

      setProducts((prev) => (reset ? newProducts : [...prev, ...newProducts]));

      // ✅ Use total if provided
      if (data.total !== undefined) {
        setHasMore(pageNumber * PAGE_SIZE < data.total);
      } else {
        setHasMore(newProducts.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Reset when subcategory changes
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [subcategoryId]);

  // Load next page
  useEffect(() => {
    if (page > 1) fetchProducts(page);
  }, [page]);

  // Filter local products by search
  const filteredProducts = searchQuery.trim()
    ? products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  // Intersection observer callback
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting && hasMore && !loading) {
        setPage((prev) => prev + 1);
      }
    },
    [hasMore, loading]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: `0px 0px ${FOOTER_HEIGHT_PX}px 0px`,
      threshold: 0.1,
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleIntersection]);

  return (
    <Container fluid className="mt-4">
      <Row>
        {/* Sidebar */}
        <Col xs={12} md={3} lg={3} className="mb-4">
          <CategorySidebar onSubcategorySelect={setSubcategoryId} />
        </Col>

        {/* Products */}
        <Col xs={12} md={9} lg={9}>
          <Row>
            {filteredProducts.map((product) => (
              <Col key={product.id} xs={12} sm={6} md={3} className="mb-4">
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>

          {/* Intersection observer target */}
          <div
            ref={loaderRef}
            style={{ height: "50px" }} // make sure it's visible
          />

          {loading && (
            <div className="text-center my-4">
              <Spinner animation="border" />
            </div>
          )}

          {error && <p className="text-danger text-center">{error}</p>}

          {!loading && !error && filteredProducts.length === 0 && (
            <p className="text-center">No products found.</p>
          )}

          {/* Fallback load more */}
          {!loading && hasMore && filteredProducts.length > 0 && (
            <div className="text-center my-4">
              <Button onClick={() => setPage((prev) => prev + 1)}>
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
