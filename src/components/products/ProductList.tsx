"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container, Row, Col, Spinner, Button, Alert } from "react-bootstrap";
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
  const [retryCount, setRetryCount] = useState(0);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchProducts = async (pageNumber: number, reset = false) => {
    setLoading(true);
    setError(null);

    try {
      // Try multiple API endpoints
      const endpoints = [
        `/api/ads/all?page=${pageNumber}&pageSize=${PAGE_SIZE}&${subcategoryId !== 'all' ? `subcategory_id=${subcategoryId}&` : ''}_=${Date.now()}`,
        `/api/products?page=${pageNumber}&limit=${PAGE_SIZE}&${subcategoryId !== 'all' ? `subcategoryId=${subcategoryId}&` : ''}_=${Date.now()}`,
        `/api/ads?page=${pageNumber}&limit=${PAGE_SIZE}&${subcategoryId !== 'all' ? `subcategory_id=${subcategoryId}&` : ''}_=${Date.now()}`
      ];

      let response = null;
      let lastError = null;

      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const res = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (res.ok) {
            response = res;
            break;
          }
        } catch (err) {
          lastError = err;
          console.warn(`Endpoint ${endpoint} failed:`, err);
        }
      }

      if (!response) {
        throw new Error(lastError || 'All API endpoints failed');
      }

      const data = await response.json();
      
      // Handle different response formats
      let newProducts = [];
      let total = 0;

      if (Array.isArray(data)) {
        newProducts = data;
        total = data.length;
      } else if (data.products && Array.isArray(data.products)) {
        newProducts = data.products;
        total = data.total || data.products.length;
      } else if (data.data && Array.isArray(data.data)) {
        newProducts = data.data;
        total = data.total || data.data.length;
      } else {
        newProducts = [];
        total = 0;
      }

      setProducts((prev) => (reset ? newProducts : [...prev, ...newProducts]));
      setHasMore(pageNumber * PAGE_SIZE < total);
      
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Failed to load products");
      // If we have products already, keep them. If not, try mock data
      if (products.length === 0) {
        // You can add mock data here for testing
        console.warn("No products loaded. Check your API endpoint.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset when subcategory changes
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
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

  // Retry function
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    fetchProducts(1, true);
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        {/* Sidebar */}
        <Col xs={12} md={3} lg={3} className="mb-4">
          <CategorySidebar onSubcategorySelect={setSubcategoryId} />
        </Col>

        {/* Products */}
        <Col xs={12} md={9} lg={9}>
          {error && (
            <Alert variant="danger" className="mb-4">
              <Alert.Heading>Error Loading Products</Alert.Heading>
              <p>{error}</p>
              <hr />
              <div className="d-flex gap-2">
                <Button variant="outline-danger" onClick={handleRetry}>
                  Retry
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  Tip: Make sure your backend server is running and the API endpoint exists.
                </small>
              </div>
            </Alert>
          )}

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
            style={{ height: "50px" }} 
          />

          {loading && (
            <div className="text-center my-4">
              <Spinner animation="border" variant="success" />
              <p className="mt-2 text-muted">Loading products...</p>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-5">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h5>No products found</h5>
              <p className="text-muted">
                {searchQuery ? `No results for "${searchQuery}"` : 'Try selecting a different category'}
              </p>
            </div>
          )}

          {/* Fallback load more */}
          {!loading && !error && hasMore && filteredProducts.length > 0 && (
            <div className="text-center my-4">
              <Button 
                variant="success" 
                onClick={() => setPage((prev) => prev + 1)}
                className="px-4"
              >
                Load More
              </Button>
            </div>
          )}

          {!loading && !error && !hasMore && filteredProducts.length > 0 && (
            <div className="text-center my-4 text-muted">
              <small>You've reached the end</small>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductList;