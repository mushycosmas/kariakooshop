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
  whole_seller_price: number | string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  slug: string;
  location?: string;
  created_at?: string;

  images?: ProductImage[];
  wholesale_tiers?: WholesaleTier[];

  category?: { slug: string };
  subcategory?: { slug: string };

  district?: { id: number; name: string };
}

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const router = useRouter();
  const image = product.images?.[0]?.path;

  const getPrice = () => {
    if (product.wholesale_tiers?.length) {
      const prices = product.wholesale_tiers
        .map(t => Number(t.whole_seller_price))
        .filter(p => p > 0);

      if (prices.length) return Math.min(...prices);
    }
    return product.price || 0;
  };

  const price = getPrice();

  const timeAgo = (date?: string) => {
    if (!date) return '';

    const diff = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
    return `${Math.floor(diff / 2592000)}mo`;
  };

  const handleClick = async () => {
    const url = `/products/${product.category?.slug || 'cat'}/${
      product.subcategory?.slug || 'subcat'
    }/${product.slug}`;

    try {
      await fetch(`/api/ads/${product.slug}/view`, { method: 'POST' });
    } catch {}

    router.push(url);
  };

  return (
    <>
      <Card className="product-card border-0 shadow-sm" onClick={handleClick}>
        
        {/* IMAGE */}
        <div className="image-wrapper">
          {image ? (
            <img src={image} alt={product.name} className="product-image" />
          ) : (
            <div className="no-image">No Image</div>
          )}
        </div>

        {/* CONTENT */}
        <Card.Body className="content">
          <h6 className="product-title">{product.name}</h6>

          <div className="price">Tsh {price.toLocaleString()}</div>

          <div className="meta">
            <span className="location">
              📍 {product.location || 'Unknown'}
              {product.district?.name && ` • ${product.district.name}`}
            </span>

            <span className="time">
              {timeAgo(product.created_at)} ago
            </span>
          </div>
        </Card.Body>
      </Card>

      <style jsx>{`
        .product-card {
          cursor: pointer;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
        }

        /* DESKTOP */
        .image-wrapper {
          height: 220px;
          background: #f6f7f9;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .content {
          padding: 12px;
        }

        .product-title {
          font-size: 15px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .price {
          font-size: 16px;
          font-weight: 700;
          color: #198754;
        }

        .meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6c757d;
        }

        /* 🔥 MOBILE FULL HEIGHT (JIJI STYLE) */
        @media (max-width: 576px) {
          .product-card {
            height: 100vh;
            display: flex;
            flex-direction: column;
            border-radius: 0;
          }

          .image-wrapper {
            flex: 1;
            height: 100%;
          }

          .product-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .content {
            padding: 12px;
            background: #fff;
          }

          .product-title {
            white-space: normal;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
      `}</style>
    </>
  );
};

export default ProductCard;