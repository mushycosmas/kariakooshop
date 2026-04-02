'use client';

import React from 'react';
import { Card } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

export interface ProductImage {
  id: number;
  ad_id: number;
  path: string;
}

export interface WholesaleTier {
  min_qty: number;
  max_qty: number;
  whole_seller_price: number;
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
  wholesale_tiers?: WholesaleTier[]; // ✅ IMPORTANT
  category?: { slug: string };
  subcategory?: { slug: string };
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const firstImage = product.images?.[0]?.path;

  // ✅ Get lowest price (wholesale or normal)
  const getDisplayPrice = () => {
    if (product.wholesale_tiers && product.wholesale_tiers.length > 0) {
      const validPrices = product.wholesale_tiers
        .map((t) => Number(t.whole_seller_price))
        .filter((p) => p > 0);

      if (validPrices.length > 0) {
        return Math.min(...validPrices);
      }
    }
    return product.price || 0;
  };

  const displayPrice = getDisplayPrice();
  const isWholesale = product.wholesale_tiers && product.wholesale_tiers.length > 0;

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
    window.location.href = url;
  };

  // ✅ Time ago helper
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diff = Math.floor((now.getTime() - posted.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <>
      <Card
        className="h-100 shadow-sm border rounded-4 product-card"
        style={{
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'transform 0.3s, box-shadow 0.3s',
        }}
        onClick={handleClick}
      >
        {/* IMAGE */}
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
          {/* NAME */}
          <Card.Title
            className="text-truncate mb-2"
            title={product.name}
            style={{ fontWeight: 600, fontSize: '1rem' }}
          >
            {product.name}
          </Card.Title>

           {/* PRICE */}
<div
  className="mb-2 d-flex align-items-center flex-wrap"
  style={{
    fontWeight: 700,
    color: '#198754',
    fontSize: '1.1rem',
  }}
>
  Tsh {displayPrice.toLocaleString()}

  {/* 🔥 Wholesale badge */}
  {isWholesale && (
    <span
      style={{
        fontSize: '0.7rem',
        background: '#ffc107',
        padding: '2px 6px',
        borderRadius: '4px',
        marginLeft: '6px',
        fontWeight: 600,
      }}
    >
      Wholesale
    </span>
  )}
</div>

          {/* FOOTER */}
          <div
            className="mt-auto d-flex justify-content-between align-items-center text-muted"
            style={{ fontSize: '0.85rem' }}
          >
            <span>
              📍 {product.location || 'Dar es Salaam'}
            </span>

            {product.postedTime && (
              <small>{getTimeAgo(product.postedTime)}</small>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* STYLES */}
      <style jsx>{`
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .product-img {
          width: 100%;
          height: 260px;
          object-fit: cover;
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
        }
      `}</style>
    </>
  );
};

export default ProductCard;