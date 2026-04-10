'use client';

import React, { useState, useEffect } from 'react';
import { Form, Button, Col, Row, Alert, Image, Card } from 'react-bootstrap';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useSession } from 'next-auth/react';
import imageCompression from 'browser-image-compression';
import { useLocations } from '@/hooks/useLocations';

interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

const SimpleAdsForm = () => {
  const { data: session } = useSession();
  const { countries } = useLocations();

  const [form, setForm] = useState({
    name: '',
    price: '',
    min_order_qty: '',
    wholesale_tiers: [{ min_qty: 1, max_qty: 5, whole_seller_price: '' }],
    product_description: '',
    category_id: '',
    subcategory_id: '',
    location: '',
    district_id: '',
    user_id: '',
    country: 'Tanzania',
    region_id: '', // only used for selecting districts, not submitted
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: { attributes: { class: 'form-control', style: 'min-height:150px;' } },
    onUpdate: ({ editor }) => {
      setForm(prev => ({ ...prev, product_description: editor.getHTML() }));
    },
  });

  // Set user_id
  useEffect(() => {
    if (session?.user?.id) {
      setForm(prev => ({ ...prev, user_id: String(session.user.id) }));
    }
  }, [session]);

  // Load categories
  useEffect(() => {
    fetch('/api/all_categories')
      .then(res => res.json())
      .then(setCategories)
      .catch(() => setMessage('Failed to load categories'));
  }, []);

  // Filter subcategories
  useEffect(() => {
    const cat = categories.find(c => c.id === form.category_id);
    setSubcategories(cat ? cat.subcategories : []);
  }, [form.category_id, categories]);

  // Load regions from countries hook (Tanzania)
  useEffect(() => {
    const country = countries.find(c => c.name === 'Tanzania');
    setRegions(country?.regions || []);
  }, [countries]);

  // Update districts when region changes
  useEffect(() => {
    const selectedRegion = regions.find(r => r.id === form.region_id);
    setDistricts(selectedRegion?.districts || []);
    setForm(prev => ({ ...prev, district_id: '' })); // reset district
  }, [form.region_id, regions]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const addTier = () => {
    setForm(prev => ({
      ...prev,
      wholesale_tiers: [...prev.wholesale_tiers, { min_qty: 1, max_qty: 5, whole_seller_price: '' }],
    }));
  };

  const updateTier = (i: number, field: 'min_qty' | 'max_qty' | 'whole_seller_price', value: string) => {
    const updated = [...form.wholesale_tiers];
    updated[i] = { ...updated[i], [field]: field === 'whole_seller_price' ? value : Number(value) || 0 };
    setForm(prev => ({ ...prev, wholesale_tiers: updated }));
  };

  const removeTier = (i: number) => {
    setForm(prev => ({ ...prev, wholesale_tiers: prev.wholesale_tiers.filter((_, idx) => idx !== i) }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const newFiles: File[] = [];

    for (const file of fileArray) {
      try {
        const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024 });
        newFiles.push(compressed);
      } catch {
        newFiles.push(file);
      }
    }

    setImages(prev => [...prev, ...newFiles]);
    setPreviewUrls(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviewUrls(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Required fields check
    if (!form.name || !form.category_id || !form.subcategory_id || !form.district_id || !form.location || images.length === 0) {
      setMessage('Please fill all required fields');
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key !== 'wholesale_tiers' && key !== 'region_id') data.append(key, value as string);
    });
    data.append('wholesale_tiers', JSON.stringify(form.wholesale_tiers));
    images.forEach(file => data.append('images[]', file));

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ads', { method: 'POST', body: data });
      const result = await res.json();
      setMessage(result.message || 'Success');

      if (res.ok) {
        setForm(prev => ({
          ...prev,
          name: '',
          price: '',
          min_order_qty: '',
          wholesale_tiers: [{ min_qty: 1, max_qty: 5, whole_seller_price: '' }],
          product_description: '',
          category_id: '',
          subcategory_id: '',
          location: '',
          district_id: '',
          region_id: '',
        }));
        setImages([]);
        setPreviewUrls([]);
        editor?.commands.setContent('');
      }
    } catch {
      setMessage('Error submitting product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form className="container py-4" onSubmit={handleSubmit}>
      {message && <Alert variant="info">{message}</Alert>}

      {/* Basic Info */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5>Basic Information</h5>
          <Row className="mb-3">
            <Col md={6}><Form.Label>Product Name *</Form.Label><Form.Control name="name" value={form.name} onChange={handleChange} /></Col>
            <Col md={3}><Form.Label>Retail Price</Form.Label><Form.Control type="number" name="price" value={form.price} onChange={handleChange} /></Col>
            <Col md={3}><Form.Label>Min Order Qty</Form.Label><Form.Control type="number" name="min_order_qty" value={form.min_order_qty} onChange={handleChange} /></Col>
          </Row>
          <Row>
            <Col md={6}><Form.Label>Category *</Form.Label>
              <Form.Select name="category_id" value={form.category_id} onChange={handleChange}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Form.Select>
            </Col>
            <Col md={6}><Form.Label>Subcategory *</Form.Label>
              <Form.Select name="subcategory_id" value={form.subcategory_id} onChange={handleChange}>
                <option value="">Select Subcategory</option>
                {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Form.Select>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={4}><Form.Label>Region</Form.Label>
              <Form.Select name="region_id" value={form.region_id} onChange={handleChange}>
                <option value="">Select Region</option>
                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Form.Select>
            </Col>
            <Col md={4}><Form.Label>District *</Form.Label>
              <Form.Select name="district_id" value={form.district_id} onChange={handleChange} disabled={!form.region_id}>
                <option value="">Select District</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Form.Select>
            </Col>
            <Col md={4}><Form.Label>Location *</Form.Label>
              <Form.Control name="location" value={form.location} onChange={handleChange} placeholder="e.g. Kariakoo" />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Wholesale */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5>Wholesale Pricing</h5>
          {form.wholesale_tiers.map((tier, i) => (
            <Row key={i} className="mb-2">
              <Col md={3}><Form.Control type="number" value={tier.min_qty} onChange={(e) => updateTier(i, 'min_qty', e.target.value)} /></Col>
              <Col md={3}><Form.Control type="number" value={tier.max_qty} onChange={(e) => updateTier(i, 'max_qty', e.target.value)} /></Col>
              <Col md={3}><Form.Control type="number" value={tier.whole_seller_price} onChange={(e) => updateTier(i, 'whole_seller_price', e.target.value)} /></Col>
              <Col md={3}><Button variant="danger" onClick={() => removeTier(i)}>Remove</Button></Col>
            </Row>
          ))}
          <Button size="sm" onClick={addTier}>+ Add Tier</Button>
        </Card.Body>
      </Card>

      {/* Description */}
      <Card className="mb-4 shadow-sm">
        <Card.Body><h5>Description</h5><EditorContent editor={editor} /></Card.Body>
      </Card>

      {/* Images */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5>Images</h5>
          <Form.Control type="file" multiple onChange={handleImageChange} />
          <div className="d-flex gap-2 mt-3 flex-wrap">
            {previewUrls.map((url, i) => (
              <div key={i} className="position-relative">
                <Image src={url} width={100} height={100} />
                <Button size="sm" variant="danger" onClick={() => removeImage(i)}>×</Button>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Button type="submit" className="w-100" disabled={isSubmitting}>
        {isSubmitting ? 'Posting...' : 'Post Product'}
      </Button>
    </Form>
  );
};

export default SimpleAdsForm;