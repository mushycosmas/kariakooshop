'use client';

import { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Card, Button, Image } from 'react-bootstrap';
import AdsDetails from '@/components/products/AdsDetails';
import StartChat from '@/components/Buttons/StartChat';
import MainLayout from '@/components/MainLayout';
import SafetyTipsCard from '@/components/Cards/SafetyTipsCard';
import { Product } from '../../../../types/Product';
import { signIn, useSession } from 'next-auth/react';

const AdDetail = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const { status } = useSession(); // Tracks authentication state

  useEffect(() => {
    const storedProduct = sessionStorage.getItem('selectedProduct');
    if (storedProduct) {
      setProduct(JSON.parse(storedProduct) as Product);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!product) {
    return (
      <Alert variant="danger" className="mt-4">
        Product not found in session storage.
      </Alert>
    );
  }

  // Destructure seller from product.seller (not user)
const seller = product.user ?? {};
const avatar = seller.avatar_url
  ? `https://kariakooplus.shop${seller.avatar_url}`
  : '/default-avatar.png';

  const sellerName = seller.name || 'Unknown Seller';
  const phone = seller.phone || 'N/A';
  const email = seller.email || '';

  return (
    <MainLayout>
      <Container className="mt-4">
        <Row>
          {/* Ad Details */}
          <Col lg={8}>
            <AdsDetails product={product} />
          </Col>

          {/* Seller Info Sidebar */}
         <Col lg={4}>
  <Card className="shadow-sm border rounded-3 p-3 text-center">
    <Image
      src={avatar}
      roundedCircle
      width={80}
      height={80}
      className="mb-3 mx-auto d-block" // ✅ Center the avatar
      alt="Seller Avatar"
    />
    <h5 className="fw-bold mb-1">{sellerName}</h5>
    <small className="text-muted">Verified Seller</small>
    <hr />
    <p>
      <i className="bi bi-telephone-fill me-2" />
      {phone}
    </p>
    {email && (
      <p>
        <i className="bi bi-envelope-fill me-2" />
        {email}
      </p>
    )}
    <Button
      variant="success"
      href={`https://wa.me/${phone.replace(/\s|\+/g, '')}?text=Hi%2C%20I'm%20interested%20in%20your%20product%20${encodeURIComponent(
        product.name
      )}`}
      className="w-100 mt-2"
      target="_blank"
      rel="noopener noreferrer"
    >
      <i className="bi bi-whatsapp me-2" />
      Chat via WhatsApp
    </Button>

    {/* Always render StartChat */}
    <StartChat adId={product.id} productName={product.name} />

    {/* Show login prompt if unauthenticated */}
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

  {/* Safety Tips */}
  <SafetyTipsCard />
</Col>

        </Row>
          {/* <SimilarAds currentProduct={product} products={allProducts} /> */}
      </Container>
    </MainLayout>
  );
};

export default AdDetail;
