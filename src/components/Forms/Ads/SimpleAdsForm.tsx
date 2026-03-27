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
      <Button size="sm" variant={editor.isActive('bold') ? 'primary' : 'light'} onClick={() => editor.chain().focus().toggleBold().run()} className="me-2"><b>B</b></Button>
      <Button size="sm" variant={editor.isActive('italic') ? 'primary' : 'light'} onClick={() => editor.chain().focus().toggleItalic().run()} className="me-2"><i>I</i></Button>
      <Button size="sm" variant={editor.isActive('strike') ? 'primary' : 'light'} onClick={() => editor.chain().focus().toggleStrike().run()} className="me-2">S</Button>
      <Button size="sm" variant={editor.isActive('bulletList') ? 'primary' : 'light'} onClick={() => editor.chain().focus().toggleBulletList().run()} className="me-2">• List</Button>
      <Button size="sm" variant={editor.isActive('orderedList') ? 'primary' : 'light'} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</Button>
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
    location: '',
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
    fetch('/api/all_categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setMessage('Failed to load categories'));
  }, []);

  useEffect(() => {
    if (form.category_id) {
      const category = categories.find((cat) => cat.id === form.category_id);
      setFilteredSubcategories(category ? category.subcategories : []);
      setForm((prev) => ({ ...prev, subcategory_id: '' }));
    }
  }, [form.category_id, categories]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔥 UPDATED IMAGE HANDLER WITH COMPRESSION
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (files.length + images.length > 5) {
      setMessage('Maximum 5 images allowed');
      return;
    }

    const compressedFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // ❌ reject large files
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Each image must be less than 5MB');
        continue;
      }

      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });

        compressedFiles.push(compressed);
      } catch (err) {
        console.error(err);
      }
    }

    const updatedImages = [...images, ...compressedFiles];

    setImages(updatedImages);
    setPreviewUrls(updatedImages.map((file) => URL.createObjectURL(file)));

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.category_id || !form.subcategory_id || !form.location || images.length === 0) {
      setMessage('Fill all fields and upload at least one image');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      // ✅ compressed images used here
      images.forEach((file) => data.append('images[]', file));

      const res = await fetch('/api/ads', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        setMessage('Ad posted successfully!');
        setForm({
          name: '',
          price: '',
          product_description: '',
          category_id: '',
          subcategory_id: '',
          status: 'active',
          user_id: session?.user?.id ? String(session.user.id) : '',
          location: '',
        });
        setImages([]);
        setPreviewUrls([]);
        editor?.commands.setContent('');
      } else {
        setMessage(result.message || 'Failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Upload error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-4 bg-white shadow-sm rounded" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {message && <Alert variant="info">{message}</Alert>}

      <Row className="mb-3">
        <Col md={6}>
          <Form.Control name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
        </Col>
        <Col md={3}>
          <Form.Control name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
        </Col>
        <Col md={3}>
          <Form.Select name="category_id" value={form.category_id} onChange={handleChange} required>
            <option value="">Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Form.Select>
        </Col>
      </Row>

      <Form.Control type="file" multiple accept="image/*" onChange={handleImageChange} disabled={images.length >= 5} />

      <div className="d-flex gap-2 mt-3 flex-wrap">
        {previewUrls.map((url, i) => (
          <div key={i} className="position-relative">
            <Image src={url} width={100} height={100} />
            <Button size="sm" variant="danger" onClick={() => removeImage(i)} className="position-absolute top-0 end-0">×</Button>
          </div>
        ))}
      </div>

      <Button type="submit" className="mt-3" disabled={isSubmitting}>
        {isSubmitting ? 'Posting...' : 'Post Ad'}
      </Button>
    </Form>
  );
};

export default SimpleAdsForm;