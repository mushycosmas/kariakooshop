'use client';

import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import { Product } from '../../types/Product';

interface SimilarAdsProps {
  currentProduct: Product;
  products: Product[];
}

const SimilarAds: React.FC<SimilarAdsProps> = ({ currentProduct, products = [] }) => {
  if (!currentProduct.category) return null; // no category, no similar

  const currentCategorySlug = currentProduct.category.slug;

  const similar = products.filter((p) => {
    return (
      p.id !== currentProduct.id &&
      p.category?.slug === currentCategorySlug
    );
  });

  if (similar.length === 0) return null;

  return (
    <>
      <h4 className="mt-5 mb-3">Similar Ads</h4>
      <Row>
        {similar.map((ad) => (
          <Col md={4} key={ad.id} className="mb-4">
            <Link href={`/ads/${ad.slug}`} passHref>
              <Card className="h-100 shadow-sm" style={{ cursor: 'pointer' }}>
                <Card.Img
                  variant="top"
                  src={ad.images?.[0]?.path || '/placeholder.png'}
                  alt={ad.name}
                />
                <Card.Body>
                  <Card.Title>{ad.name}</Card.Title>
                  <Card.Text>Tsh {ad.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default SimilarAds;
