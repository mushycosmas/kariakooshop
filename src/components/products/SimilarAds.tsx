'use client';

import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Product } from '../../types/Product';
import ProductCard from './ProductCard'; // Make sure this path is correct

interface SimilarAdsProps {
  currentProduct: Product;
  products: Product[];
}

const SimilarAds: React.FC<SimilarAdsProps> = ({ currentProduct, products = [] }) => {
  // If current product has no category, we cannot show similar ads
  if (!currentProduct.category) return null;

  const currentCategorySlug = currentProduct.category.slug;

  // Filter products by same category but exclude current product
  const similar = products.filter(
    (p) => p.id !== currentProduct.id && p.category?.slug === currentCategorySlug
  );

  // If no similar products found, don't render anything
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
