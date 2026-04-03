import React, { useEffect, useState } from "react";
import { Card, Row, Col, Image } from "react-bootstrap";

type Product = {
  id: number;
  name: string;
  viewed: number;
  image?: string;
};

const TopProducts = ({ sellerId }: { sellerId: number }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/seller/top-products?sellerId=${sellerId}`);
        const data: Product[] = await res.json();
        console.log("TOP PRODUCTS API:", data); 
        setProducts(data);
      } catch (error) {
        console.error("Top products fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, [sellerId]);

  if (loading) return <p>Loading top products...</p>;

  return (
    <Card className="shadow-sm border-0 rounded-4 mt-4">
      <Card.Body>
        <h5 className="fw-bold mb-3">Top 10 Most Viewed Products</h5>
        {products.length === 0 ? (
          <p>No products yet</p>
        ) : (
          <Row className="g-3">
            {products.map((product) => (
              <Col xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card className="h-100 shadow-sm border-0 rounded-3">
                  <Image
                    src={product.image || "/placeholder.png"} // fallback image
                    alt={product.name}
                    fluid
                    className="rounded-top"
                    style={{ objectFit: "cover", height: "180px", width: "100%" }}
                  />
                  <Card.Body>
                    <Card.Title className="mb-1" style={{ fontSize: "0.95rem" }}>
                      {product.name}
                    </Card.Title>
                    <small className="text-muted">Views: {product.viewed}</small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

export default TopProducts;