'use client';

import React, { useState, useEffect } from 'react';
import { Form, Button, Col, Row, Alert, Image } from 'react-bootstrap';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useSession } from 'next-auth/react';
import imageCompression from 'browser-image-compression';

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


const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files) {
    if (files.length + images.length > 5) {
      setMessage('You can upload a maximum of 5 images.');
      return;
    }

    const newFiles: File[] = [];
    for (const file of Array.from(files)) {
      try {
        // Compress each image
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,        // Max size in MB
          maxWidthOrHeight: 1024, // Max width/height
          useWebWorker: true,
        });
        newFiles.push(compressedFile);
      } catch (error) {
        console.error('Image compression error:', error);
        newFiles.push(file); // fallback to original if compression fails
      }
    }

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
  <Form
    onSubmit={handleSubmit}
    className="p-4 bg-white shadow-sm rounded"
    style={{ maxWidth: '1000px', margin: '0 auto' }}
  >
    {message && (
      <Alert variant="info" className="mb-4">
        {message}
      </Alert>
    )}

    <h5 className="mb-3 fw-bold">Basic Information</h5>

    <Row className="mb-3">
      <Col md={6}>
        <Form.Group controlId="productName">
          <Form.Label className="fw-semibold">Product Name *</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="shadow-sm"
          />
        </Form.Group>
      </Col>

      <Col md={3}>
        <Form.Group controlId="productPrice">
          <Form.Label className="fw-semibold">Price (TZS) *</Form.Label>
          <Form.Control
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            className="shadow-sm"
          />
        </Form.Group>
      </Col>

      <Col md={3}>
        <Form.Group controlId="productCategory">
          <Form.Label className="fw-semibold">Main Category *</Form.Label>
          <Form.Select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            required
            className="shadow-sm"
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

    <Row className="mb-4">
      <Col md={6}>
        <Form.Group controlId="productSubcategory">
          <Form.Label className="fw-semibold">Subcategory *</Form.Label>
          <Form.Select
            name="subcategory_id"
            value={form.subcategory_id}
            onChange={handleChange}
            required
            disabled={!form.category_id || filteredSubcategories.length === 0}
            className="shadow-sm"
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
          <Form.Label className="fw-semibold">Ad Location *</Form.Label>
          <Form.Control
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            className="shadow-sm"
          />
        </Form.Group>
      </Col>
    </Row>

    <h5 className="mb-3 fw-bold">Description</h5>

    <Form.Group className="mb-4">
      <MenuBar editor={editor} />

      <div
        style={{
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          minHeight: '140px',
          backgroundColor: '#fff',
          padding: '10px',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </Form.Group>

    <h5 className="mb-3 fw-bold">Images</h5>

    <Form.Group className="mb-3">
      <Form.Control
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        disabled={images.length >= 5}
        className="shadow-sm"
      />
      <small className="text-muted">
        Max 5 images allowed
      </small>
    </Form.Group>

    <div className="d-flex flex-wrap gap-3 mb-4">
      {previewUrls.map((url, index) => (
        <div
          key={index}
          className="position-relative"
          style={{
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #eee',
          }}
        >
          <Image
            src={url}
            width={110}
            height={110}
            style={{ objectFit: 'cover' }}
          />

          <Button
            size="sm"
            variant="danger"
            onClick={() => removeImage(index)}
            className="position-absolute top-0 end-0 m-1 rounded-circle"
            style={{ width: '22px', height: '22px', padding: 0 }}
          >
            ×
          </Button>
        </div>
      ))}
    </div>

    <div className="d-grid">
      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="fw-semibold py-2"
      >
        {isSubmitting ? 'Posting...' : 'Post Ad'}
      </Button>
    </div>
  </Form>
);
};

export default SimpleAdsForm;
