'use client';

import React, { useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

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

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hasMultipleImages) {
      setCurrentImageIndex(1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
  };

  const currentImage = images[currentImageIndex]?.path || images[0]?.path;

  return (
    <>
      <Card 
        className="product-card border-0" 
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
      >
        {/* IMAGE */}
        <div className="image-wrapper">
          {currentImage ? (
            <>
              <img 
                src={currentImage} 
                alt={product.name} 
                className={`product-image ${isHovered && hasMultipleImages ? 'image-transition' : ''}`}
                loading="lazy"
              />
              
              {/* Click indicator overlay - appears on hover */}
              <div className="click-indicator">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 11L12 6L17 11M12 6V18" />
                </svg>
                <span>Click to view</span>
              </div>
              
              {/* Image counter badge */}
              {hasMultipleImages && (
                <div className="image-counter">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15L16 10L5 21" />
                  </svg>
                  <span>{images.length}</span>
                </div>
              )}

              {/* Hover indicator */}
              {hasMultipleImages && (
                <div className={`hover-indicator ${isHovered ? 'visible' : ''}`}>
                  <span>View image {currentImageIndex + 1} of {images.length}</span>
                </div>
              )}
            </>
          ) : (
            <div className="no-image">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15L16 10L5 21" />
              </svg>
              <span>No Image</span>
            </div>
          )}

          {/* Thumbnail dots */}
          {hasMultipleImages && (
            <div className="thumbnail-dots">
              {images.map((_, index) => (
                <span 
                  key={index} 
                  className={`dot ${currentImageIndex === index ? 'active' : ''}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* CONTENT */}
        <Card.Body className="content">
          <div className="top-row">
            <h6 className="product-title">{product.name}</h6>
            {product.wholesale_tiers?.length && (
              <div className="wholesale-badge">Wholesale</div>
            )}
          </div>

          <div className="price-row">
            <span className="price">Tsh {price.toLocaleString()}</span>
          </div>

          <div className="meta">
            <span className="location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {product.location || 'Unknown'}
              {product.district?.name && ` • ${product.district.name}`}
            </span>

            <span className="time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {timeAgo(product.created_at)} ago
            </span>
          </div>
        </Card.Body>
      </Card>

      <style jsx>{`
        .product-card {
          cursor: pointer;
          border-radius: 16px;
          overflow: hidden;
          background: #ffffff;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .product-card:active {
          transform: scale(0.98);
        }

        /* IMAGE */
        .image-wrapper {
          position: relative;
          height: 200px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
        }

        .image-transition {
          animation: imageFade 0.3s ease;
        }

        @keyframes imageFade {
          0% { opacity: 0.6; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }

        .product-card:hover .product-image {
          transform: scale(1.05);
        }

        /* Click indicator - appears on hover */
        .click-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.8);
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          color: white;
          padding: 12px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          font-weight: 500;
          font-size: 13px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .product-card:hover .click-indicator {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }

        .click-indicator svg {
          stroke: white;
          animation: bounceArrow 1.5s ease-in-out infinite;
        }

        @keyframes bounceArrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }

        .no-image {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #94a3b8;
          gap: 8px;
          font-size: 14px;
        }

        .no-image svg {
          opacity: 0.5;
        }

        /* Image counter */
        .image-counter {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          color: white;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
          pointer-events: none;
        }

        .image-counter svg {
          stroke: white;
        }

        /* Hover indicator */
        .hover-indicator {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          color: white;
          font-size: 11px;
          padding: 6px 16px;
          border-radius: 20px;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          white-space: nowrap;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        .hover-indicator.visible {
          opacity: 1;
        }

        /* Thumbnail dots */
        .thumbnail-dots {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .product-card:hover .thumbnail-dots {
          opacity: 1;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          transition: all 0.3s ease;
        }

        .dot.active {
          background: #ffffff;
          width: 16px;
          border-radius: 3px;
        }

        /* CONTENT */
        .content {
          padding: 16px 16px 14px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .product-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .wholesale-badge {
          background: #f1f5f9;
          color: #475569;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 10px;
          border-radius: 20px;
          letter-spacing: 0.3px;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .price {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.3px;
        }

        .meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #64748b;
          margin-top: auto;
          padding-top: 6px;
          border-top: 1px solid #f1f5f9;
        }

        .location, .time {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .location svg, .time svg {
          flex-shrink: 0;
        }

        /* MOBILE */
        @media (max-width: 576px) {
          .product-card {
            border-radius: 0;
            height: 100vh;
            box-shadow: none;
          }

          .product-card:hover {
            transform: none;
            box-shadow: none;
          }

          .image-wrapper {
            height: 100%;
            flex: 1;
          }

          .product-card:hover .product-image {
            transform: none;
          }

          .content {
            padding: 16px 16px 20px;
            background: #ffffff;
            border-top: 1px solid #f1f5f9;
          }

          .product-title {
            font-size: 16px;
          }

          .price {
            font-size: 20px;
          }

          .meta {
            font-size: 13px;
          }

          .thumbnail-dots {
            opacity: 1;
          }

          .hover-indicator {
            display: none;
          }

          .image-counter {
            font-size: 10px;
            padding: 3px 8px;
          }

          .click-indicator {
            display: none;
          }
        }

        /* Tablet */
        @media (min-width: 577px) and (max-width: 992px) {
          .image-wrapper {
            height: 180px;
          }
        }
      `}</style>
    </>
  );
};

export default ProductCard;