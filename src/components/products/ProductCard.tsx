'use client';

import React from 'react';
import { Card, Badge } from 'react-bootstrap';
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

  // ---------------- PRICE ----------------
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
  const isWholesale = !!product.wholesale_tiers?.length;

  // ---------------- TIME AGO ----------------
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

  // ---------------- CLICK ----------------
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
      <Card className="product-card border-0 shadow-sm rounded-4" onClick={handleClick}>
        {/* IMAGE */}
        <div className="image-wrapper">
          {image ? (
            <img src={image} alt={product.name} className="product-image" />
          ) : (
            <div className="no-image">No Image</div>
          )}

          {/* BADGE */}
          {isWholesale && (
            <Badge className="wholesale-badge">Wholesale</Badge>
          )}
        </div>

        {/* BODY */}
        <Card.Body className="p-3 d-flex flex-column">
          {/* NAME */}
          <h6 className="product-title">{product.name}</h6>

          {/* PRICE */}
          <div className="price">
            Tsh {price.toLocaleString()}
          </div>

          {/* FOOTER */}
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

      {/* STYLE */}
      <style jsx>{`
        .product-card {
          cursor: pointer;
          transition: all 0.25s ease;
          overflow: hidden;
          background: #fff;
        }

        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
        }

        .image-wrapper {
          position: relative;
          height: 220px;
          overflow: hidden;
          background: #f8f9fa;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.08);
        }

        .no-image {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-weight: 500;
        }

        .wholesale-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #ffc107;
          color: #000;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .product-title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .price {
          font-size: 16px;
          font-weight: 700;
          color: #198754;
          margin-bottom: 10px;
        }

        .meta {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6c757d;
        }

        .location {
          max-width: 70%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .time {
          white-space: nowrap;
        }

        @media (max-width: 576px) {
          .image-wrapper {
            height: 170px;
          }
        }
      `}</style>
    </>
  );
};

export default ProductCard;