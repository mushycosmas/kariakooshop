'use client';

import React, { useState } from 'react';
import { Form, Button, Col, Row, Alert, Image } from 'react-bootstrap';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="mb-2">
      <Button size="sm" variant={editor.isActive('bold') ? 'primary' : 'light'} onClick={() => editor.chain().focus().toggleBold().run()} className="me-2"><b>B</b></Button>
      <Button size="sm" variant={editor.isActive('italic') ? 'primary' : 'light'} onClick={() => editor.chain().focus().toggleItalic().run()} className="me-2"><i>I</i></Button>
      <Button size="sm" variant={editor.isActive('strike') ? 'primary' : 'light'} onClick={() => editor.chain().focus().toggleStrike().run()} className="me-2">S</Button>
      <Button size="sm" variant={editor.isActive('bulletList') ? 'primary' : 'light'} onClick={() => editor.chain().focus().toggleBulletList().run()} className="me-2">• List</Button>
      <Button size="sm" variant={editor.isActive('orderedList') ? 'primary' : 'light'} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</Button>
    </div>
  );
};

const SimpleAdsForm = () => {
  const [form, setForm] = useState({
    name: '',
    price: '',
    product_description: '',
    subcategory_id: '',
    status: 'active',
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (!form.name || !form.price || !form.subcategory_id || images.length === 0) {
      setMessage('Please fill all required fields and add at least one image.');
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    images.forEach((file) => data.append('images[]', file));

    try {
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
          subcategory_id: '',
          status: 'active',
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
          <Form.Group>
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
          <Form.Group>
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
          <Form.Group>
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
              {/* Add more as needed */}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Product Description</Form.Label>
        <MenuBar editor={editor} />
        <div style={{ border: '1px solid #ced4da', borderRadius: '.25rem', minHeight: '120px', backgroundColor: 'white', padding: '0.5rem' }}>
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
        />
      </Form.Group>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {previewUrls.map((url, index) => (
          <div key={index} className="position-relative">
            <Image src={url} thumbnail width={100} height={100} />
            <Button
              size="sm"
              variant="danger"
              onClick={() => removeImage(index)}
              className="position-absolute top-0 end-0 p-1"
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
