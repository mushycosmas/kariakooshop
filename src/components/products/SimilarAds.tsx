'use client';

import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Product } from '../../types/Product';
import ProductCard from './ProductCard'; // make sure this path is correct

interface SimilarAdsProps {
  currentProduct: Product;
  products: Product[];
}

const SimilarAds: React.FC<SimilarAdsProps> = ({ currentProduct, products = [] }) => {
  if (!currentProduct.category) return null; // no category, no similar ads

  const currentCategorySlug = currentProduct.category.slug;

  // Filter products in the same category excluding the current product
  const similar = products.filter(
    (p) => p.id !== currentProduct.id && p.category?.slug === currentCategorySlug
  );

  if (similar.length === 0) return null;

  return (
    <>
      <h4 className="mt-5 mb-3">Similar Ads</h4>
      <Row>
        {similar.map((ad) => (
          <Col md={4} key={ad.id} className="mb-4">
            <ProductCard product={ad} />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default SimilarAds;
