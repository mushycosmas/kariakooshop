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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchProducts = async (pageNumber: number, reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const endpoints = [
        `/api/ads/all?page=${pageNumber}&pageSize=${PAGE_SIZE}&${subcategoryId !== 'all' ? `subcategory_id=${subcategoryId}&` : ''}_=${Date.now()}`,
        `/api/products?page=${pageNumber}&limit=${PAGE_SIZE}&${subcategoryId !== 'all' ? `subcategoryId=${subcategoryId}&` : ''}_=${Date.now()}`,
        `/api/ads?page=${pageNumber}&limit=${PAGE_SIZE}&${subcategoryId !== 'all' ? `subcategory_id=${subcategoryId}&` : ''}_=${Date.now()}`
      ];

      let response = null;
      let lastErrorMessage = 'All API endpoints failed';

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
          } else {
            lastErrorMessage = `HTTP ${res.status}: ${res.statusText}`;
          }
        } catch (err) {
          lastErrorMessage = err instanceof Error ? err.message : 'Network error';
          console.warn(`Endpoint ${endpoint} failed:`, err);
        }
      }

      if (!response) {
        throw new Error(lastErrorMessage);
      }

      const data = await response.json();
      
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

      const newHasMore = pageNumber * PAGE_SIZE < total;
      setHasMore(newHasMore);
      
      setProducts((prev) => {
        if (reset) {
          return newProducts;
        }
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id));
        return [...prev, ...uniqueNewProducts];
      });
      
      setIsInitialLoad(false);
      
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Failed to load products");
      
      if (products.length === 0) {
        console.warn("No products loaded. Check your API endpoint.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setIsInitialLoad(true);
    fetchProducts(1, true);
  }, [subcategoryId]);

  useEffect(() => {
    if (page > 1 && !isInitialLoad) {
      fetchProducts(page);
    }
  }, [page]);

  const filteredProducts = searchQuery.trim()
    ? products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting && hasMore && !loading && !isInitialLoad) {
        console.log("Loading more products...");
        setPage((prev) => prev + 1);
      }
    },
    [hasMore, loading, isInitialLoad]
  );

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px 0px 100px 0px',
      threshold: 0.5,
    });

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observerRef.current.observe(currentLoader);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setIsInitialLoad(true);
    fetchProducts(1, true);
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col xs={12} md={3} lg={3} className="mb-4">
          <CategorySidebar onSubcategorySelect={setSubcategoryId} />
        </Col>

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

          {!error && hasMore && products.length > 0 && (
            <div
              ref={loaderRef}
              style={{ height: "20px", margin: "10px 0" }}
            />
          )}

          {loading && (
            <div className="text-center my-4">
              <Spinner animation="border" variant="success" />
              <p className="mt-2 text-muted">Loading products...</p>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && !isInitialLoad && (
            <div className="text-center py-5">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h5>No products found</h5>
              <p className="text-muted">
                {searchQuery ? `No results for "${searchQuery}"` : 'Try selecting a different category'}
              </p>
            </div>
          )}

          {!loading && !error && hasMore && filteredProducts.length > 0 && filteredProducts.length < 50 && (
            <div className="text-center my-4">
              <Button 
                variant="success" 
                onClick={() => setPage((prev) => prev + 1)}
                className="px-4"
                disabled={loading}
              >
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