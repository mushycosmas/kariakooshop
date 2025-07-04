'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Form, Button, Col, Row, Alert, Image, Spinner } from 'react-bootstrap';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import SellerDashboardLayout from '@/components/SellerDashboardLayout';

type ProductForm = {
  name: string;
  price: string; // keeping string for easy input binding
  product_description: string;
  subcategory_id: string;
  status: string;
};

const MenuBar = ({ editor }: { editor: ReturnType<typeof useEditor> | null }) => {
  if (!editor) return null;

  return (
    <div className="mb-2">
      <Button
        size="sm"
        variant={editor.isActive('bold') ? 'primary' : 'light'}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="me-2"
      >
        <b>B</b>
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('italic') ? 'primary' : 'light'}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="me-2"
      >
        <i>I</i>
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('strike') ? 'primary' : 'light'}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className="me-2"
      >
        S
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('bulletList') ? 'primary' : 'light'}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className="me-2"
      >
        • List
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('orderedList') ? 'primary' : 'light'}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </Button>
    </div>
  );
};

const EditProductForm: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState<ProductForm>({
    name: '',
    price: '',
    product_description: '',
    subcategory_id: '',
    status: 'active',
  });

  // Existing images URLs from backend
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // New images uploaded in this session
  const [newImages, setNewImages] = useState<File[]>([]);
  // Previews for new images
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: form.product_description,
    onUpdate: ({ editor }) => {
      setForm((prev) => ({
        ...prev,
        product_description: editor.getHTML(),
      }));
    },
  });

  // Fetch product details when id and editor ready
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/seller/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');

        const data = await res.json();

        setForm({
          name: data.product.name || '',
          price: data.product.price?.toString() || '',
          product_description: data.product.product_description || '',
          subcategory_id: data.product.subcategory_id?.toString() || '',
          status: data.product.status || 'active',
        });

        setExistingImages(data.images || []);

        if (editor) {
          editor.commands.setContent(data.product.product_description || '');
        }
      } catch (error) {
        console.error(error);
        setMessage('Error loading product data');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, editor]);

  // Handle input/select changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle new image uploads
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      const updatedNewImages = [...newImages, ...filesArray];
      setNewImages(updatedNewImages);
      setPreviewUrls(updatedNewImages.map((file) => URL.createObjectURL(file)));
      // Clear file input to allow same file upload again if needed
      e.target.value = '';
    }
  };

  // Remove an existing image URL (marks for removal)
  const removeExistingImage = (urlToRemove: string) => {
    setExistingImages((imgs) => imgs.filter((url) => url !== urlToRemove));
  };

  // Remove new uploaded image by index
  const removeNewImage = (index: number) => {
    const filteredImages = newImages.filter((_, i) => i !== index);
    setNewImages(filteredImages);
    setPreviewUrls(filteredImages.map((file) => URL.createObjectURL(file)));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.price.trim() || !form.subcategory_id.trim()) {
      setMessage('Please fill all required fields.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const formData = new FormData();

      // Append form fields
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append existing images URLs to keep
      existingImages.forEach((url) => {
        formData.append('existingImages', url);
      });

      // Append new images
      newImages.forEach((file) => {
        formData.append('newImages', file);
      });

      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setMessage(result.message || 'Product updated successfully!');
        // Redirect after short delay
        setTimeout(() => {
          router.push('/seller/products');
        }, 1500);
      } else {
        setMessage(result.message || 'Update failed.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred while updating the product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner animation="border" role="status" />;

  return (
    <SellerDashboardLayout>
      <Form onSubmit={handleSubmit} className="p-3">
        {message && <Alert variant="info">{message}</Alert>}

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="productName">
              <Form.Label>Product Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group controlId="productPrice">
              <Form.Label>Price (TZS) *</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                step="any"
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group controlId="productSubcategory">
              <Form.Label>Subcategory *</Form.Label>
              <Form.Select
                name="subcategory_id"
                value={form.subcategory_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Subcategory</option>
                <option value="1">Phones</option>
                <option value="2">Laptops</option>
                <option value="3">Clothing</option>
                {/* TODO: Replace with dynamic subcategories */}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Product Description</Form.Label>
          <MenuBar editor={editor} />
          <div
            style={{
              border: '1px solid #ced4da',
              borderRadius: '.25rem',
              minHeight: '120px',
              backgroundColor: 'white',
              padding: '0.5rem',
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Existing Images</Form.Label>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {existingImages.length === 0 && <div>No existing images</div>}
            {existingImages.map((url, idx) => (
              <div key={idx} className="position-relative" style={{ width: 100 }}>
                <Image src={url} thumbnail width={100} height={100} alt={`Existing image ${idx + 1}`} />
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => removeExistingImage(url)}
                  className="position-absolute top-0 end-0 p-1"
                  aria-label="Remove existing image"
                >
                  &times;
                </Button>
              </div>
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Upload New Images</Form.Label>
          <Form.Control type="file" multiple accept="image/*" onChange={handleImageChange} />
        </Form.Group>

        <div className="d-flex flex-wrap gap-2 mb-3">
          {previewUrls.map((url, index) => (
            <div key={index} className="position-relative" style={{ width: 100 }}>
              <Image src={url} thumbnail width={100} height={100} alt={`New upload ${index + 1}`} />
              <Button
                size="sm"
                variant="danger"
                onClick={() => removeNewImage(index)}
                className="position-absolute top-0 end-0 p-1"
                aria-label="Remove new image"
              >
                &times;
              </Button>
            </div>
          ))}
        </div>

        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Updating...' : 'Update Product'}
        </Button>
      </Form>
    </SellerDashboardLayout>
  );
};

export default EditProductForm;
