'use client';

import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Col,
  Row,
  Alert,
  Image,
  Card,
} from 'react-bootstrap';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useSession } from 'next-auth/react';
import imageCompression from 'browser-image-compression';

/* ================= TYPES ================= */

interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

type Tier = {
  min_qty: number;
  max_qty: number;
  whole_seller_price: string;
};

type FormState = {
  name: string;
  price: string;
  min_order_qty: string;
  wholesale_tiers: Tier[];
  product_description: string;
  category_id: string;
  subcategory_id: string;
  location: string;
  user_id: string;
};

type EditableTierField = 'min_qty' | 'max_qty' | 'whole_seller_price';

/* ================= COMPONENT ================= */

const SimpleAdsForm = () => {
  const { data: session } = useSession();

  const [form, setForm] = useState<FormState>({
    name: '',
    price: '',
    min_order_qty: '',
    wholesale_tiers: [
      { min_qty: 1, max_qty: 5, whole_seller_price: '' },
    ],
    product_description: '',
    category_id: '',
    subcategory_id: '',
    location: '',
    user_id: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================= EDITOR ================= */

  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: 'form-control',
        style: 'min-height:150px;',
      },
    },
    onUpdate: ({ editor }) => {
      setForm((prev) => ({
        ...prev,
        product_description: editor.getHTML(),
      }));
    },
  });

  /* ================= EFFECTS ================= */

  // Set user ID
  useEffect(() => {
    if (session?.user?.id) {
      setForm((prev) => ({
        ...prev,
        user_id: String(session.user.id),
      }));
    }
  }, [session]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/all_categories');
        const data = await res.json();
        setCategories(data);
      } catch {
        setMessage('Failed to load categories');
      }
    };

    loadCategories();
  }, []);

  // Filter subcategories
  useEffect(() => {
    const cat = categories.find((c) => c.id === form.category_id);
    setFilteredSubcategories(cat ? cat.subcategories : []);
  }, [form.category_id, categories]);

  /* ================= HANDLERS ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ===== WHOLESALE ===== */

  const addTier = () => {
    setForm((prev) => ({
      ...prev,
      wholesale_tiers: [
        ...prev.wholesale_tiers,
        { min_qty: 1, max_qty: 5, whole_seller_price: '' },
      ],
    }));
  };

  const updateTier = (
    index: number,
    field: EditableTierField,
    value: string
  ) => {
    const updated = [...form.wholesale_tiers];

    updated[index][field] =
      field === 'whole_seller_price'
        ? value
        : Number(value) || 0;

    setForm((prev) => ({
      ...prev,
      wholesale_tiers: updated,
    }));
  };

  const removeTier = (index: number) => {
    setForm((prev) => ({
      ...prev,
      wholesale_tiers: prev.wholesale_tiers.filter((_, i) => i !== index),
    }));
  };

  /* ===== IMAGES ===== */

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    const newFiles: File[] = [];

    for (const file of files) {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
      });
      newFiles.push(compressed);
    }

    setImages((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [
      ...prev,
      ...newFiles.map((f) => URL.createObjectURL(f)),
    ]);

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  /* ===== SUBMIT ===== */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.category_id ||
      !form.subcategory_id ||
      !form.location ||
      images.length === 0
    ) {
      setMessage('Please fill all required fields');
      return;
    }

    const validPrices = form.wholesale_tiers
      .map((t) => Number(t.whole_seller_price))
      .filter((p) => p > 0);

    const lowestPrice =
      validPrices.length > 0
        ? Math.min(...validPrices)
        : Number(form.price || 0);

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key !== 'wholesale_tiers') {
        data.append(key, value);
      }
    });

    data.append('price', String(lowestPrice));
    data.append('wholesale_tiers', JSON.stringify(form.wholesale_tiers));

    images.forEach((file) => data.append('images[]', file));

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      setMessage(result.message || 'Success');

      if (res.ok) {
        setForm({
          name: '',
          price: '',
          min_order_qty: '',
          wholesale_tiers: [
            { min_qty: 1, max_qty: 5, whole_seller_price: '' },
          ],
          product_description: '',
          category_id: '',
          subcategory_id: '',
          location: 'Dar es Salaam',
          user_id: session?.user?.id
            ? String(session.user.id)
            : '',
        });

        editor?.commands.setContent('');
        setImages([]);
        setPreviewUrls([]);
      }
    } catch {
      setMessage('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Form className="container py-4" onSubmit={handleSubmit}>
      {message && <Alert variant="info">{message}</Alert>}

      {/* BASIC */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5>Basic Information</h5>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Product Name *</Form.Label>
              <Form.Control
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </Col>

            <Col md={3}>
              <Form.Label>Retail Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
              />
            </Col>

            <Col md={3}>
              <Form.Label>Min Order Qty</Form.Label>
              <Form.Control
                type="number"
                name="min_order_qty"
                value={form.min_order_qty}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Label>Category *</Form.Label>
              <Form.Select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Subcategory *</Form.Label>
              <Form.Select
                name="subcategory_id"
                value={form.subcategory_id}
                onChange={handleChange}
              >
                <option value="">Select Subcategory</option>
                {filteredSubcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <Form.Group className="mt-3">
            <Form.Label>Location *</Form.Label>
            <Form.Control
              name="location"
              value={form.location}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {/* WHOLESALE */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5>Wholesale Pricing</h5>

          {form.wholesale_tiers.map((tier, i) => (
            <Row key={i} className="mb-2">
              <Col md={3}>
                <Form.Control
                  type="number"
                  value={tier.min_qty}
                  onChange={(e) =>
                    updateTier(i, 'min_qty', e.target.value)
                  }
                />
              </Col>

              <Col md={3}>
                <Form.Control
                  type="number"
                  value={tier.max_qty}
                  onChange={(e) =>
                    updateTier(i, 'max_qty', e.target.value)
                  }
                />
              </Col>

              <Col md={3}>
                <Form.Control
                  type="number"
                  value={tier.whole_seller_price}
                  onChange={(e) =>
                    updateTier(
                      i,
                      'whole_seller_price',
                      e.target.value
                    )
                  }
                />
              </Col>

              <Col md={3}>
                <Button
                  variant="danger"
                  onClick={() => removeTier(i)}
                >
                  Remove
                </Button>
              </Col>
            </Row>
          ))}

          <Button size="sm" onClick={addTier}>
            + Add Tier
          </Button>
        </Card.Body>
      </Card>

      {/* DESCRIPTION */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5>Description</h5>
          <EditorContent editor={editor} />
        </Card.Body>
      </Card>

      {/* IMAGES */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5>Images</h5>
          <Form.Control
            type="file"
            multiple
            onChange={handleImageChange}
          />

          <div className="d-flex gap-2 mt-3 flex-wrap">
            {previewUrls.map((url, i) => (
              <div key={i} className="position-relative">
                <Image src={url} width={100} height={100} />
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => removeImage(i)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Button
        type="submit"
        className="w-100"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Posting...' : 'Post Product'}
      </Button>
    </Form>
  );
};

export default SimpleAdsForm;