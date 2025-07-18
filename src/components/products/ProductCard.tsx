'use client';

import React from 'react';
import { Card } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

export interface ProductImage {
  id: number;
  ad_id: number;
  path: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  slug: string;
  path?: string;
  location?: string;
  postedTime?: string;
  images?: ProductImage[];
  category?: { slug: string };
  subcategory?: { slug: string };
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const firstImage = product.images?.[0]?.path;

   const handleClick = async () => {
    sessionStorage.setItem('selectedProduct', JSON.stringify(product));
    const categorySlug = product.category?.slug || 'category';
    const subcategorySlug = product.subcategory?.slug || 'subcategory';
    const productSlug = product.slug;
      try {
      await fetch(`/api/ads/${productSlug}/view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
    router.push(`/products/${categorySlug}/${subcategorySlug}/${productSlug}`);
    const url = `/products/${categorySlug}/${subcategorySlug}/${productSlug}`;
    window.location.href = url; // Forces full page reload
  };

  return (
    <>
      <Card
        className="h-100 shadow-sm border rounded-3"
        style={{ cursor: 'pointer', overflow: 'hidden' }}
        onClick={handleClick}
      >
        {firstImage ? (
          <Card.Img
            variant="top"
            src={firstImage}
            alt={product.name}
            className="product-img"
            draggable={false}
          />
        ) : (
          <div className="product-img no-image">
            <span>No Image</span>
          </div>
        )}

        <Card.Body className="d-flex flex-column p-3">
          {/* Product Name */}
          <Card.Title
            className=" text-truncate"
            title={product.name}
            style={{ fontWeight: 600, fontSize: '1rem', lineHeight: '1.3' }}
          >
            {product.name}
          </Card.Title>

          {/* Price */}
          <div
            className=""
            style={{
              fontWeight: 700,
              color: '#198754',
              fontSize: '1.1rem',
            }}
          >
            Tsh{' '}
            {product.price.toLocaleString(undefined, {
              minimumFractionDigits: 0,
            })}
          </div>

          {/* Location */}
          <div
            className="mt-auto d-flex justify-content-between align-items-center text-muted "
            style={{ fontSize: '0.85rem' }}
          >
            <span>
              <i className="bi bi-geo-alt-fill me-1"></i>
              {product.location || 'Dar es Salaam'}
            </span>
          </div>
        </Card.Body>
      </Card>

      <style jsx>{`
        .product-img {
          width: 100%;
          height: 250px;
          object-fit: cover;
          object-position: center;
          border-top-left-radius: 0.3rem;
          border-top-right-radius: 0.3rem;
          user-select: none;
        }

        @media (max-width: 576px) {
          .product-img {
            height: 180px;
          }
        }

        .no-image {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #e9ecef;
          color: #6c757d;
          font-weight: 500;
          font-size: 1rem;
        }
      `}</style>
    </>
  );
};

export default ProductCard;
