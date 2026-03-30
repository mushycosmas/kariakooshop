'use client';

import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import striptags from 'striptags';
import { Product } from '../../types/Product';

interface AdsDetailsProps {
  product: Product;
}

const AdsDetails: React.FC<AdsDetailsProps> = ({ product }) => {
  const hasImages = Array.isArray(product.images) && product.images.length > 0;
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const cleanDescription = product.description ? striptags(product.description) : '';

  const images = hasImages ? product.images! : [{ path: '/no-image.png' }];

  return (
    <>
      <style>{`
        .main-image-wrapper {
          width: 100%;
          height: 700px;
          border-radius: 12px;
          overflow: hidden;
          background-color: #f8f9fa;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          transition: transform 0.3s ease;
        }
        .main-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .thumbnail-container {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .thumbnail-container img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: border-color 0.3s ease, transform 0.2s ease;
        }
        .thumbnail-container img:hover {
          transform: scale(1.05);
        }
        .thumbnail-container img.selected {
          border-color: #0d6efd;
        }
        @media (max-width: 768px) {
          .main-image-wrapper { height: 400px; }
        }
        @media (max-width: 480px) {
          .main-image-wrapper { height: 300px; }
        }
      `}</style>

      <Card className="p-3 shadow-sm border rounded-4">
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
            style={{ fontWeight: 600, fontSize: '1.1rem' }}
          >
            {product.name}
          </Card.Title>

          <div
            style={{
              fontWeight: 700,
              color: '#198754',
              fontSize: '1.2rem',
            }}
          >
            Tsh {product.price.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>

          {/* Wholesale Pricing */}
          {product.wholesale_tiers && product.wholesale_tiers.length > 0 && (
            <Card className="mt-3 shadow-sm border rounded-3">
              <Card.Body>
                <h5 className="fw-bold mb-3">Wholesale Pricing(Bei Ya Jumla)</h5>
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Quantity</th>
                        <th>Price (Tsh)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.wholesale_tiers.map((tier, index) => (
                        <tr key={index}>
                          <td>{tier.min_qty} - {tier.max_qty}</td>
                          <td className="fw-bold text-success">
                            {Number(tier.whole_seller_price).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <small className="text-muted d-block mt-2">
                  💡 Buy more, pay less
                </small>
              </Card.Body>
            </Card>
          )}

          {/* Location */}
          <div
            className="mt-3 d-flex align-items-center text-muted"
            style={{ fontSize: '0.9rem' }}
          >
            <i className="bi bi-geo-alt-fill me-1" />
            {product.location || 'Dar es Salaam'}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-3" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
              {cleanDescription}
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default AdsDetails;