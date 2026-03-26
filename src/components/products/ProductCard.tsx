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
  description?: string;
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

  const firstImageUrl = firstImage
  ? `/api/uploads/${firstImage.split('/').pop()}`
  : null;

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

    const url = `/products/${categorySlug}/${subcategorySlug}/${productSlug}`;
    router.push(url);
    window.location.href = url; // Forces full reload
  };

  // Helper to format postedTime as "time ago"
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diff = Math.floor((now.getTime() - posted.getTime()) / 1000); // in seconds

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <>
      <Card
        className="h-100 shadow-sm border rounded-4 product-card"
        style={{ cursor: 'pointer', overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s' }}
        onClick={handleClick}
      >
        {firstImageUrl ? (
          <Card.Img
            variant="top"
            src={firstImageUrl}
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
            className="text-truncate mb-2"
            title={product.name}
            style={{ fontWeight: 600, fontSize: '1rem', lineHeight: '1.3' }}
          >
            {product.name}
          </Card.Title>

          {/* Price */}
          <div
            className="mb-2"
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

          {/* Description */}
          {product.description && (
            <div
              className="text-muted mb-3"
              style={{
                fontSize: '0.85rem',
                lineHeight: '1.3',
              }}
              dangerouslySetInnerHTML={{
                __html:
                  product.description.length > 60
                    ? product.description.slice(0, 60) + '...'
                    : product.description,
              }}
            />
          )}

          {/* Location & Posted Time */}
          <div
            className="mt-auto d-flex justify-content-between align-items-center text-muted"
            style={{ fontSize: '0.85rem' }}
          >
            <span>
              <i className="bi bi-geo-alt-fill me-1"></i>
              {product.location || 'Dar es Salaam'}
            </span>
            {product.postedTime && <small>{getTimeAgo(product.postedTime)}</small>}
          </div>
        </Card.Body>
      </Card>

      <style jsx>{`
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .product-img {
          width: 100%;
          height: 260px;
          object-fit: cover;
          object-position: center;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          user-select: none;
          transition: transform 0.3s;
        }

        .product-card:hover .product-img {
          transform: scale(1.05);
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