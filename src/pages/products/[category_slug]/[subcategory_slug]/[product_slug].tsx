'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Spinner, Alert, Card, Button, Image } from 'react-bootstrap';
import AdsDetails from '@/components/products/AdsDetails';
import SimilarAds from '@/components/products/SimilarAds';
import StartChat from '@/components/Buttons/StartChat';
import MainLayout from '@/components/MainLayout';
import SafetyTipsCard from '@/components/Cards/SafetyTipsCard';
import { Product } from '../../../../types/Product';
import { signIn, useSession } from 'next-auth/react';

const CACHE_DURATION_MS = 15 * 60 * 1000;

const AdDetail = () => {
  const router = useRouter();
 const { category_slug, subcategory_slug, product_slug } = router.query;

  console.log("Test slug",product_slug);
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingAllProducts, setLoadingAllProducts] = useState(true);

  const { status } = useSession();

  // Load product: first from sessionStorage, then fallback to slug fetch
  useEffect(() => {
    const loadProduct = async () => {
      const storedProduct = sessionStorage.getItem('selectedProduct');

      if (storedProduct) {
        setProduct(JSON.parse(storedProduct));
        setLoadingProduct(false);
      } else if (product_slug) {
        try {
          const res = await fetch(`/api/ads/${product_slug}`);
          if (!res.ok) throw new Error('Product not found');
          const data = await res.json();
          setProduct(data);
        } catch (err) {
          console.error('Failed to fetch product by slug:', err);
        } finally {
          setLoadingProduct(false);
        }
      }
    };

    loadProduct();
  }, [product_slug]);

  // Load all products for SimilarAds
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoadingAllProducts(true);
      const cacheKey = 'all_products_cache';
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const now = Date.now();

          if (parsed?.data && parsed.timestamp && now - parsed.timestamp < CACHE_DURATION_MS) {
            setAllProducts(parsed.data);
            setLoadingAllProducts(false);
            return;
          } else {
            localStorage.removeItem(cacheKey);
          }
        } catch {
          localStorage.removeItem(cacheKey);
        }
      }

      try {
        const res = await fetch('/api/ads/all');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        const fetchedProducts = data.products || [];
        setAllProducts(fetchedProducts);

        localStorage.setItem(
          cacheKey,
          JSON.stringify({ data: fetchedProducts, timestamp: Date.now() })
        );
      } catch (err) {
        console.error('Error fetching all products:', err);
        setAllProducts([]);
      } finally {
        setLoadingAllProducts(false);
      }
    };

    fetchAllProducts();
  }, []);

  if (loadingProduct || loadingAllProducts) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!product) {
    return (
      <Alert variant="danger" className="mt-4 text-center">
        Product not found.
      </Alert>
    );
  }

  const seller = product.user ?? {};
  const avatar = seller.avatar_url
    ? `https://kariakooplus.shop${seller.avatar_url}`
    : '/default-avatar.png';

  return (
    <MainLayout>
      <Container className="mt-4">
        <Row>
          <Col lg={8}>
            <AdsDetails product={product} />
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm border rounded-3 p-3 text-center">
              <Image
                src={avatar}
                roundedCircle
                width={80}
                height={80}
                className="mb-3 mx-auto d-block"
                alt="Seller Avatar"
              />
              <h5 className="fw-bold mb-1">{seller.name || 'Unknown Seller'}</h5>
              <small className="text-muted">Verified Seller</small>
              <hr />
              <p><i className="bi bi-telephone-fill me-2" />{seller.phone || 'N/A'}</p>
              {seller.email && (
                <p><i className="bi bi-envelope-fill me-2" />{seller.email}</p>
              )}

              <Button
                variant="success"
                href={`https://wa.me/${(seller.phone || '').replace(/\s|\+/g, '')}?text=Hi%2C%20I'm%20interested%20in%20your%20product%20${encodeURIComponent(product.name)}`}
                className="w-100 mt-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-whatsapp me-2" />
                Chat via WhatsApp
              </Button>

              <StartChat adId={product.id} productName={product.name} />

              {status === 'unauthenticated' && (
                <div
                  style={{
                    position: 'fixed',
                    top: '6rem',
                    right: '1rem',
                    background: 'white',
                    border: '1px solid #ddd',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    cursor: 'pointer',
                  }}
                  onClick={() => signIn('google')}
                  title="Sign in with Google"
                >
                  🔒 Login with Google
                </div>
              )}
            </Card>

            <SafetyTipsCard />
          </Col>
        </Row>

        <Row className="mt-5">
          <Col>
            <SimilarAds
              currentProduct={product}
              products={product.category ? allProducts : []}
            />
          </Col>
        </Row>
      </Container>
    </MainLayout>
  );
};

export default AdDetail;
