import { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Badge, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { useSession } from "next-auth/react";
interface Product {
  id: number;
  name: string;
  price: number;
  stock?: number;
  image_url?: string;
  status: string;
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const userId = session?.user?.id;


  useEffect(() => {
  if (!userId) return; // Wait until session is ready

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/seller/products?user_id=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, [userId]);


  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((product) => product.id !== id));
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h4 className="fw-bold">My Products</h4>
          <p className="text-muted">Manage your product listings here.</p>
        </Col>
        <Col className="text-end">
          <Link href="/seller/products/add" passHref>
            <Button variant="primary">+ Add New Product</Button>
          </Link>
        </Col>
      </Row>

      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          products.map((product) => (
            <Col key={product.id}>
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={product.image_url || '/products/default.jpg'}
                  alt={product.name}
                  style={{ height: '180px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title className="fw-semibold mb-2">{product.name}</Card.Title>
                  <div className="mb-1 text-muted">
                    TSh{Number(product.price).toFixed(2)}
                  </div>
                  {product.stock !== undefined && (
                    <div className="mb-2 small">Stock: {product.stock}</div>
                  )}
                  <Badge
                    bg={product.status.toLowerCase() === 'active' ? 'success' : 'secondary'}
                    className="mb-3"
                  >
                    {product.status}
                  </Badge>

                  <div className="d-flex justify-content-between">
                    <Link href={`/api/seller/products/edit/${product.id}`} passHref>
                      <Button size="sm" variant="outline-primary">Edit</Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};

export default ProductList;
