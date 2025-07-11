'use client';

import React, { useState, useEffect } from 'react';
import { Form, Button, Col, Row, Alert, Image } from 'react-bootstrap';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useSession } from 'next-auth/react';

const MenuBar = ({ editor }: { editor: any }) => {
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

interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: { id: string; name: string }[];
}

const SimpleAdsForm = () => {
  const { data: session, status } = useSession();

  const [form, setForm] = useState({
    name: '',
    price: '',
    product_description: '',
    category_id: '',
    subcategory_id: '',
    status: 'active',
    user_id: '',
    location: '', // ✅ added location
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: form.product_description,
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, product_description: editor.getHTML() }));
    },
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      setForm((prev) => ({ ...prev, user_id: String(session.user.id) }));
    }
  }, [session, status]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/all_categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (error) {
        console.error(error);
        setMessage('Failed to load categories');
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (form.category_id) {
      const category = categories.find((cat) => cat.id === form.category_id);
      setFilteredSubcategories(category ? category.subcategories : []);
      setForm((prev) => ({ ...prev, subcategory_id: '' }));
    } else {
      setFilteredSubcategories([]);
      setForm((prev) => ({ ...prev, subcategory_id: '' }));
    }
  }, [form.category_id, categories]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (files.length + images.length > 5) {
        setMessage('You can upload a maximum of 5 images.');
        return;
      }

      const newFiles = Array.from(files);
      const updatedImages = [...images, ...newFiles];
      setImages(updatedImages);
      setPreviewUrls(updatedImages.map((file) => URL.createObjectURL(file)));
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.price ||
      !form.category_id ||
      !form.subcategory_id ||
      !form.location || // ✅ validate location
      images.length === 0 ||
      !form.user_id
    ) {
      setMessage('Please fill all required fields, add at least one image, and ensure you are logged in.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });
      images.forEach((file) => data.append('images[]', file));

      const res = await fetch('/api/ads', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (res.ok) {
        setMessage(result.message || 'Ad submitted successfully!');
        setForm({
          name: '',
          price: '',
          product_description: '',
          category_id: '',
          subcategory_id: '',
          status: 'active',
          user_id: session?.user?.id ? String(session.user.id) : '',
          location: '', // ✅ reset location
        });
        setImages([]);
        setPreviewUrls([]);
        editor?.commands.setContent('');
      } else {
        setMessage(result.message || 'Submission failed.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred while submitting the ad.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group controlId="productCategory">
            <Form.Label>Main Category *</Form.Label>
            <Form.Select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="productSubcategory">
            <Form.Label>Subcategory *</Form.Label>
            <Form.Select
              name="subcategory_id"
              value={form.subcategory_id}
              onChange={handleChange}
              required
              disabled={!form.category_id || filteredSubcategories.length === 0}
            >
              <option value="">
                {filteredSubcategories.length === 0
                  ? 'Select category first'
                  : 'Select Subcategory'}
              </option>
              {filteredSubcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="adLocation">
            <Form.Label>Ad Location *</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
            />
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
        <Form.Label>Upload Images *</Form.Label>
        <Form.Control
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          disabled={images.length >= 5}
        />
      </Form.Group>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {previewUrls.map((url, index) => (
          <div key={index} className="position-relative">
            <Image
              src={url}
              thumbnail
              width={100}
              height={100}
              alt={`Preview ${index + 1}`}
            />
            <Button
              size="sm"
              variant="danger"
              onClick={() => removeImage(index)}
              className="position-absolute top-0 end-0 p-1"
              aria-label={`Remove image ${index + 1}`}
            >
              &times;
            </Button>
          </div>
        ))}
      </div>

      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Posting...' : 'Post Ad'}
      </Button>
    </Form>
  );
};

export default SimpleAdsForm;
