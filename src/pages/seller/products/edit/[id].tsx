'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Form, Button, Col, Row, Alert, Image, Card, Spinner } from 'react-bootstrap';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import SellerDashboardLayout from '@/components/SellerDashboardLayout';
import imageCompression from 'browser-image-compression';
import { useLocations } from '@/hooks/useLocations';

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
  district_id: string;
  status: string;
  wholesale_tiers: { min_qty: number; max_qty: number; whole_seller_price: string }[];
  region_id: string;
}

const EditProductForm: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { countries } = useLocations();

  const [form, setForm] = useState<ProductForm>({
    name: '',
    price: '',
    product_description: '',
    category_id: '',
    subcategory_id: '',
    location: '',
    district_id: '',
    status: 'active',
    wholesale_tiers: [{ min_qty: 1, max_qty: 5, whole_seller_price: '' }],
    region_id: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: { attributes: { class: 'form-control', style: 'min-height:150px;' } },
    onUpdate: ({ editor }) => setForm(prev => ({ ...prev, product_description: editor.getHTML() })),
  });

  // Fetch categories
  useEffect(() => {
    fetch('/api/all_categories')
      .then(res => res.json())
      .then(setCategories)
      .catch(() => setMessage('Failed to load categories'));
  }, []);

  // Load regions from country
  useEffect(() => {
    const country = countries.find(c => c.name === 'Tanzania');
    setRegions(country?.regions || []);
  }, [countries]);

  // Fetch product data
  useEffect(() => {
    if (!id || regions.length === 0) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/seller/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();

        // Determine region based on district
        let regionId = '';
        for (const region of regions) {
          const foundDistrict = region.districts?.find(
            (d: any) => String(d.id) === String(data.product.district_id)
          );
          if (foundDistrict) {
            regionId = String(region.id);
            break;
          }
        }

        setForm({
          name: data.product.name || '',
          price: data.product.price?.toString() || '',
          product_description: data.product.product_description || '',
          category_id: String(data.product.category_id || ''),
          subcategory_id: String(data.product.subcategory_id || ''),
          location: data.product.location || '',
          district_id: String(data.product.district_id || ''),
          status: data.product.status || 'active',
          wholesale_tiers: data.wholesale_tiers || [{ min_qty: 1, max_qty: 5, whole_seller_price: '' }],
          region_id: regionId,
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
  }, [id, regions, editor]);

  // Update districts when region changes
  useEffect(() => {
    const selectedRegion = regions.find(r => String(r.id) === String(form.region_id));
    setDistricts(selectedRegion?.districts || []);
    // If current district doesn't belong to selected region, reset it
    if (!selectedRegion?.districts?.some(d => String(d.id) === String(form.district_id))) {
      setForm(prev => ({ ...prev, district_id: '' }));
    }
  }, [form.region_id, regions]);

  // Update subcategories when category changes
  useEffect(() => {
    const cat = categories.find(c => c.id === form.category_id);
    setSubcategories(cat ? cat.subcategories : []);
    if (!cat?.subcategories?.some(s => s.id === form.subcategory_id)) {
      setForm(prev => ({ ...prev, subcategory_id: '' }));
    }
  }, [form.category_id, categories]);

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Wholesale tiers
  const addTier = () => setForm(prev => ({
    ...prev,
    wholesale_tiers: [...prev.wholesale_tiers, { min_qty: 1, max_qty: 5, whole_seller_price: '' }]
  }));

  const updateTier = (index: number, field: 'min_qty' | 'max_qty' | 'whole_seller_price', value: string) => {
    setForm(prev => {
      const updated = [...prev.wholesale_tiers];
      updated[index] = { 
        ...updated[index], 
        [field]: field === 'whole_seller_price' ? value : Number(value) || 0 
      };
      return { ...prev, wholesale_tiers: updated };
    });
  };

  const removeTier = (index: number) => setForm(prev => ({
    ...prev,
    wholesale_tiers: prev.wholesale_tiers.filter((_, i) => i !== index)
  }));

  // Image handlers
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const compressedFiles: File[] = [];
    const previewList: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024 });
        compressedFiles.push(compressed);
        previewList.push(URL.createObjectURL(compressed));
      } catch {
        compressedFiles.push(file);
        previewList.push(URL.createObjectURL(file));
      }
    }

    setNewImages(prev => [...prev, ...compressedFiles]);
    setPreviewUrls(prev => [...prev, ...previewList]);
    e.target.value = '';
  };

  useEffect(() => () => previewUrls.forEach(url => URL.revokeObjectURL(url)), [previewUrls]);

  const removeExistingImage = (url: string) => setExistingImages(prev => prev.filter(u => u !== url));
  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category_id || !form.subcategory_id || !form.district_id || !form.location) {
      setMessage('Please fill all required fields.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'wholesale_tiers' && key !== 'region_id') {
          formData.append(key, value as string);
        }
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

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <SellerDashboardLayout>
      <Form className="container py-4" onSubmit={handleSubmit}>
        {message && <Alert variant="info">{message}</Alert>}

        {/* Basic Info */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h5>Basic Information</h5>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Product Name *</Form.Label>
                <Form.Control type="text" name="name" value={form.name} onChange={handleChange} required />
              </Col>
              <Col md={3}>
                <Form.Label>Price *</Form.Label>
                <Form.Control type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="any" />
              </Col>
              <Col md={3}>
                <Form.Label>Status *</Form.Label>
                <Form.Select name="status" value={form.status} onChange={handleChange} required>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Category *</Form.Label>
                <Form.Select name="category_id" value={form.category_id} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Subcategory *</Form.Label>
                <Form.Select name="subcategory_id" value={form.subcategory_id} onChange={handleChange} required>
                  <option value="">Select Subcategory</option>
                  {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Label>Region</Form.Label>
                <Form.Select name="region_id" value={form.region_id} onChange={handleChange}>
                  <option value="">Select Region</option>
                  {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>District *</Form.Label>
                <Form.Select name="district_id" value={form.district_id} onChange={handleChange} disabled={!form.region_id} required>
                  <option value="">Select District</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>Location *</Form.Label>
                <Form.Control type="text" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Kariakoo" required />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Wholesale tiers */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h5>Wholesale Pricing</h5>
            {form.wholesale_tiers.map((tier, idx) => (
              <Row key={idx} className="mb-2">
                <Col md={3}>
                  <Form.Control 
                    type="number" 
                    placeholder="Min Qty"
                    value={tier.min_qty} 
                    onChange={e => updateTier(idx, 'min_qty', e.target.value)} 
                  />
                </Col>
                <Col md={3}>
                  <Form.Control 
                    type="number" 
                    placeholder="Max Qty"
                    value={tier.max_qty} 
                    onChange={e => updateTier(idx, 'max_qty', e.target.value)} 
                  />
                </Col>
                <Col md={3}>
                  <Form.Control 
                    type="number" 
                    placeholder="Price"
                    value={tier.whole_seller_price} 
                    onChange={e => updateTier(idx, 'whole_seller_price', e.target.value)} 
                  />
                </Col>
                <Col md={3}>
                  <Button variant="danger" onClick={() => removeTier(idx)}>Remove</Button>
                </Col>
              </Row>
            ))}
            <Button size="sm" onClick={addTier}>+ Add Tier</Button>
          </Card.Body>
        </Card>

        {/* Product description */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h5>Description</h5>
            <EditorContent editor={editor} />
          </Card.Body>
        </Card>

        {/* Images */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h5>Images</h5>
            
            {existingImages.length > 0 && (
              <>
                <Form.Label>Existing Images</Form.Label>
                <div className="d-flex gap-2 mt-2 mb-3 flex-wrap">
                  {existingImages.map((url, idx) => (
                    <div key={idx} className="position-relative">
                      <Image src={url} width={100} height={100} style={{ objectFit: 'cover' }} />
                      <Button 
                        size="sm" 
                        variant="danger" 
                        onClick={() => removeExistingImage(url)}
                        className="position-absolute top-0 end-0 p-1"
                        style={{ fontSize: '12px' }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Form.Label>Upload New Images</Form.Label>
            <Form.Control type="file" multiple accept="image/*" onChange={handleImageChange} />
            
            <div className="d-flex gap-2 mt-3 flex-wrap">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="position-relative">
                  <Image src={url} width={100} height={100} style={{ objectFit: 'cover' }} />
                  <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={() => removeNewImage(idx)}
                    className="position-absolute top-0 end-0 p-1"
                    style={{ fontSize: '12px' }}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        <Button type="submit" className="w-100" disabled={submitting}>
          {submitting ? 'Updating...' : 'Update Product'}
        </Button>
      </Form>
    </SellerDashboardLayout>
  );
};

export default EditProductForm;