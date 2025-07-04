'use client';
import React, { useState } from 'react';
import { Card } from 'react-bootstrap';

export interface ProductImage {
  path: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  slug: string;
  location?: string;
  postedTime?: string;
  description?: string;
  images?: ProductImage[] | null;
}

interface AdsDetailsProps {
  product: Product;
}

const AdsDetails: React.FC<AdsDetailsProps> = ({ product }) => {
  const hasImages = Array.isArray(product.images) && product.images.length > 0;
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const images: ProductImage[] = hasImages
    ? product.images!
    : [{ path: '/no-image.png' }];

  return (
    <>
      <style>{`
        .main-image-wrapper {
          width: 100%;
          height: 700px; /* Increased height */
          border-radius: 10px;
          overflow: hidden;
          background-color: #f8f9fa;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .main-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover; /* Changed from 'contain' */
          display: block;
        }

        .thumbnail-container {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .thumbnail-container img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: border 0.3s ease;
        }

        .thumbnail-container img.selected {
          border-color: #0d6efd;
        }

        /* Optional: Responsive height */
        @media (max-width: 768px) {
          .main-image-wrapper {
            height: 400px;
          }
        }

        @media (max-width: 480px) {
          .main-image-wrapper {
            height: 300px;
          }
        }
      `}</style>

      <Card className="p-3 shadow-sm border rounded-3">
        {/* Main Image */}
        <div className="main-image-wrapper" aria-label="Main image">
          <img
            src={images[mainImageIndex].path}
            alt={`Main image of ${product.name}`}
          />
        </div>

        {/* Thumbnails */}
        <div className="thumbnail-container" aria-label="Thumbnails">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img.path}
              alt={`Thumbnail ${idx + 1}`}
              className={idx === mainImageIndex ? 'selected' : ''}
              onClick={() => setMainImageIndex(idx)}
              loading="lazy"
            />
          ))}
        </div>

        {/* Product Info */}
        <Card.Body className="pt-3 px-0">
          <Card.Title
            className="mb-2 text-truncate"
            title={product.name}
            style={{ fontWeight: 600, fontSize: '1rem' }}
          >
            {product.name}
          </Card.Title>

          <div
            style={{
              fontWeight: 700,
              color: '#198754',
              fontSize: '1.1rem',
            }}
          >
            Tsh {product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>

          <div
            className="mt-auto d-flex justify-content-between align-items-center text-muted pt-2"
            style={{ fontSize: '0.85rem' }}
          >
            <span>
              <i className="bi bi-geo-alt-fill me-1"></i>
              {product.location || 'Dar es Salaam'}
            </span>
            <span>
              <i className="bi bi-clock-history me-1"></i>
              {product.postedTime || '2 hrs ago'}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-3" style={{ fontSize: '0.95rem' }}>
              {product.description}
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default AdsDetails;
