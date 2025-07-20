"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import ProductCard from "./ProductCard";
import CategorySidebar from "../partial/CategorySidebar";
import { Product } from "../../types/Product";

interface ProductListProps {
  defaultCategory?: string;
  searchQuery?: string;
}

const PAGE_SIZE = 12;
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const ProductList: React.FC<ProductListProps> = ({
  defaultCategory = "all",
  searchQuery = "",
}) => {
  const [subcategoryId, setSubcategoryId] = useState(defaultCategory);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const savedSubcategory = localStorage.getItem("subcategoryId");
    if (savedSubcategory) setSubcategoryId(savedSubcategory);
  }, []);

  useEffect(() => {
    localStorage.setItem("subcategoryId", subcategoryId);
  }, [subcategoryId]);

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [subcategoryId]);

  useEffect(() => {
    fetchProducts(page, page === 1);
  }, [subcategoryId, page]);

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

  const fetchProducts = async (page: number, reset = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL("/api/ads/all", window.location.origin);
      if (subcategoryId.toLowerCase() !== "all") {
        url.searchParams.append("subcategory_id", subcategoryId);
      }
      url.searchParams.append("page", String(page));
      url.searchParams.append("pageSize", String(PAGE_SIZE));

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      const fetchedProducts = data.products || [];

      setProducts((prev) => (reset ? fetchedProducts : [...prev, ...fetchedProducts]));
      setHasMore(fetchedProducts.length === PAGE_SIZE);
    } catch (err) {
      setError((err as Error).message);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col xs={12} md={3} lg={3} className="mb-4">
          <CategorySidebar onSubcategorySelect={setSubcategoryId} />
        </Col>

        <Col xs={12} md={9} lg={9}>
          <Row>
            {filteredProducts.map((product, index) => {
              const isLast = index === filteredProducts.length - 1;
              return (
                <Col
                  ref={isLast ? lastElementRef : null}
                  key={product.id}
                  xs={12}
                  sm={6}
                  md={3}
                  className="mb-4"
                >
                  <ProductCard product={product} />
                </Col>
              );
            })}
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
        </Col>
      </Row>
    </Container>
  );
};

export default ProductList;
