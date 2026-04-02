'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Form, Button, Col, Row, Alert, Image, Spinner, Card } from 'react-bootstrap';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import SellerDashboardLayout from '@/components/SellerDashboardLayout';

interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

interface ProductForm {
  name: string;
  price: string;
  product_description: string;
  category_id: string;
  subcategory_id: string;
  location: string;
  status: string;
  wholesale_tiers: { min_qty: number; max_qty: number; whole_seller_price: string }[];
}

// TipTap toolbar
const MenuBar: React.FC<{ editor: ReturnType<typeof useEditor> | null }> = ({ editor }) => {
  if (!editor) return null;

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();

  return (
    <div className="mb-2">
      <Button size="sm" variant={editor.isActive('bold') ? 'primary' : 'light'} onClick={toggleBold} className="me-2"><b>B</b></Button>
      <Button size="sm" variant={editor.isActive('italic') ? 'primary' : 'light'} onClick={toggleItalic} className="me-2"><i>I</i></Button>
      <Button size="sm" variant={editor.isActive('strike') ? 'primary' : 'light'} onClick={toggleStrike} className="me-2">S</Button>
      <Button size="sm" variant={editor.isActive('bulletList') ? 'primary' : 'light'} onClick={toggleBulletList} className="me-2">• List</Button>
      <Button size="sm" variant={editor.isActive('orderedList') ? 'primary' : 'light'} onClick={toggleOrderedList}>1. List</Button>
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
    category_id: '',
    subcategory_id: '',
    location: '',
    status: 'active',
    wholesale_tiers: [{ min_qty: 1, max_qty: 5, whole_seller_price: '' }],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: form.product_description,
    onUpdate: ({ editor }) => setForm(prev => ({ ...prev, product_description: editor.getHTML() })),
  });

  // Fetch categories
  useEffect(() => {
    fetch('/api/all_categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setMessage('Failed to load categories'));
  }, []);

  // Fetch product
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
          category_id: data.product.category_id?.toString() || '',
          subcategory_id: data.product.subcategory_id?.toString() || '',
          location: data.product.location || '',
          status: data.product.status || 'active',
          wholesale_tiers: data.wholesale_tiers || [{ min_qty: 1, max_qty: 5, whole_seller_price: '' }],
        });

        setExistingImages(data.images || []);
        editor?.commands.setContent(data.product.product_description || '');
      } catch (error) {
        console.error(error);
        setMessage('Error loading product data');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, editor]);

  // Update subcategories when category changes and preselect
  useEffect(() => {
    if (!form.category_id) {
      setFilteredSubcategories([]);
      return;
    }
    const selectedCategory = categories.find(c => c.id === form.category_id);
    if (selectedCategory) {
      setFilteredSubcategories(selectedCategory.subcategories);
      // Preselect subcategory if not in filtered
      if (!selectedCategory.subcategories.some(s => s.id === form.subcategory_id)) {
        setForm(prev => ({
          ...prev,
          subcategory_id: selectedCategory.subcategories[0]?.id || '',
        }));
      }
    }
  }, [form.category_id, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Wholesale tiers
  const addTier = () =>
    setForm(prev => ({
      ...prev,
      wholesale_tiers: [...prev.wholesale_tiers, { min_qty: 1, max_qty: 5, whole_seller_price: '' }],
    }));

  const updateTier = (index: number, field: 'min_qty' | 'max_qty' | 'whole_seller_price', value: string) => {
    setForm(prev => {
      const updated = [...prev.wholesale_tiers];
      updated[index] = { ...updated[index], [field]: field === 'whole_seller_price' ? value : Number(value) };
      return { ...prev, wholesale_tiers: updated };
    });
  };

  const removeTier = (index: number) =>
    setForm(prev => ({ ...prev, wholesale_tiers: prev.wholesale_tiers.filter((_, i) => i !== index) }));

  // Images
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setNewImages(prev => [...prev, ...newFiles]);
    setPreviewUrls(prev => [...prev, ...Array.from(files).map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeExistingImage = (url: string) => setExistingImages(prev => prev.filter(u => u !== url));

  const removeNewImage = (index: number) => {
    const updatedNewImages = [...newImages];
    const updatedPreviews = [...previewUrls];
    updatedNewImages.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setNewImages(updatedNewImages);
    setPreviewUrls(updatedPreviews);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.category_id || !form.subcategory_id || !form.location) {
      setMessage('Please fill all required fields.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'wholesale_tiers') formData.append(key, value as string);
      });
      formData.append('wholesale_tiers', JSON.stringify(form.wholesale_tiers));
      existingImages.forEach(url => formData.append('existingImages[]', url));
      newImages.forEach(file => formData.append('newImages[]', file));

      const res = await fetch(`/api/seller/products/${id}`, { method: 'PUT', body: formData });
      const result = await res.json();

      if (res.ok) {
        setMessage(result.message || 'Product updated successfully!');
        setTimeout(() => router.push('/seller/product-list'), 1500);
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

  if (loading) return <Spinner animation="border" />;

  return (
    <SellerDashboardLayout>
      <Form onSubmit={handleSubmit} className="p-3">
        {message && <Alert variant="info">{message}</Alert>}

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Product Name *</Form.Label>
              <Form.Control type="text" name="name" value={form.name} onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Price *</Form.Label>
              <Form.Control type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="any" />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Status *</Form.Label>
              <Form.Select name="status" value={form.status} onChange={handleChange} required>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Category *</Form.Label>
              <Form.Select name="category_id" value={form.category_id} onChange={handleChange} required>
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Subcategory *</Form.Label>
              <Form.Select name="subcategory_id" value={form.subcategory_id} onChange={handleChange} required>
                <option value="">Select Subcategory</option>
                {filteredSubcategories.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Location *</Form.Label>
          <Form.Control type="text" name="location" value={form.location} onChange={handleChange} required />
        </Form.Group>

        {/* Wholesale Tiers */}
        <Card className="mb-3">
          <Card.Body>
            <h5>Wholesale Tiers</h5>
            {form.wholesale_tiers.map((tier, idx) => (
              <Row key={idx} className="mb-2">
                <Col md={3}><Form.Control type="number" value={tier.min_qty} onChange={e => updateTier(idx, 'min_qty', e.target.value)} /></Col>
                <Col md={3}><Form.Control type="number" value={tier.max_qty} onChange={e => updateTier(idx, 'max_qty', e.target.value)} /></Col>
                <Col md={3}><Form.Control type="number" value={tier.whole_seller_price} onChange={e => updateTier(idx, 'whole_seller_price', e.target.value)} /></Col>
                <Col md={3}><Button variant="danger" onClick={() => removeTier(idx)}>Remove</Button></Col>
              </Row>
            ))}
            <Button size="sm" onClick={addTier}>+ Add Tier</Button>
          </Card.Body>
        </Card>

        {/* Description */}
        <Form.Group className="mb-3">
          <Form.Label>Product Description</Form.Label>
          <MenuBar editor={editor} />
          <div style={{ border: '1px solid #ced4da', borderRadius: '.25rem', minHeight: '120px', padding: '.5rem', backgroundColor: 'white' }}>
            <EditorContent editor={editor} />
          </div>
        </Form.Group>

        {/* Existing Images */}
        <Form.Group className="mb-3">
          <Form.Label>Existing Images</Form.Label>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {existingImages.length === 0 && <div>No existing images</div>}
            {existingImages.map((url, idx) => (
              <div key={idx} className="position-relative" style={{ width: 100 }}>
                <Image src={url} thumbnail width={100} height={100} />
                <Button size="sm" variant="danger" onClick={() => removeExistingImage(url)} className="position-absolute top-0 end-0 p-1">&times;</Button>
              </div>
            ))}
          </div>
        </Form.Group>

        {/* New Images */}
        <Form.Group className="mb-3">
          <Form.Label>Upload New Images</Form.Label>
          <Form.Control type="file" multiple accept="image/*" onChange={handleImageChange} />
        </Form.Group>

        <div className="d-flex flex-wrap gap-2 mb-3">
          {previewUrls.map((url, idx) => (
            <div key={idx} className="position-relative" style={{ width: 100 }}>
              <Image src={url} thumbnail width={100} height={100} />
              <Button size="sm" variant="danger" onClick={() => removeNewImage(idx)} className="position-absolute top-0 end-0 p-1">&times;</Button>
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