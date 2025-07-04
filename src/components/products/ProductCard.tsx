"use client";

import React from "react";
import { Card } from "react-bootstrap";
import { useRouter } from "next/navigation";

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

  const handleClick = () => {
    // Save product to sessionStorage BEFORE navigation
    sessionStorage.setItem("selectedProduct", JSON.stringify(product));

    const categorySlug = product.category?.slug || "category";
    const subcategorySlug = product.subcategory?.slug || "subcategory";
    const productSlug = product.slug;

    // Navigate to the product details page
    router.push(
      `/products/${categorySlug}/${subcategorySlug}/${productSlug}`
    );
  };

  return (
    <Card
      className="h-100 shadow-sm border rounded-3"
      style={{ cursor: "pointer", overflow: "hidden" }}
      onClick={handleClick}
    >
      {firstImage ? (
        <Card.Img
          variant="top"
          src={firstImage}
          alt={product.name}
          style={{
            width: "100%",
            height: 180,
            objectFit: "cover",
            objectPosition: "center",
            borderTopLeftRadius: "0.3rem",
            borderTopRightRadius: "0.3rem",
            userSelect: "none",
            pointerEvents: "none",
          }}
          draggable={false}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: 180,
            backgroundColor: "#e9ecef",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6c757d",
            fontWeight: 500,
            fontSize: "1rem",
            borderTopLeftRadius: "0.3rem",
            borderTopRightRadius: "0.3rem",
          }}
        >
          No Image
        </div>
      )}

      <Card.Body className="d-flex flex-column p-3">
        <Card.Title
          className="mb-2 text-truncate"
          title={product.name}
          style={{ fontWeight: 600, fontSize: "1rem" }}
        >
          {product.name}
        </Card.Title>

        <div
          style={{
            fontWeight: 700,
            color: "#198754",
            fontSize: "1.1rem",
          }}
        >
          Tsh {product.price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </div>

        <div
          className="mt-auto d-flex justify-content-between align-items-center text-muted pt-2"
          style={{ fontSize: "0.85rem" }}
        >
          <span>
            <i className="bi bi-geo-alt-fill me-1"></i>
            {product.location || "Dar es Salaam"}
          </span>
          <span>
            <i className="bi bi-clock-history me-1"></i>
            {product.postedTime || "Just now"}
          </span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
