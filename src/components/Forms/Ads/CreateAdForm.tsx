"use client";

import { useState, useEffect } from "react";
import { categories, subcategories, brands, models } from "../../../data/data";
import { Button, Form, Row, Col, Alert, Image } from "react-bootstrap";
import { useSession } from "next-auth/react";

interface AdFormData {
  user_id: number | null;
  name: string;
  product_description: string;
  price: string;
  status: string;
  property_images: File[];
  category_id: string;
  subcategory_id: string;
  brand_id: string;
  model_id: string;
  product_condition: string;
  warranty: string;
}

const CreateAdForm = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [formData, setFormData] = useState<AdFormData>({
    user_id: null,
    name: "",
    product_description: "",
    price: "",
    status: "active",
    property_images: [],
    category_id: "",
    subcategory_id: "",
    brand_id: "",
    model_id: "",
    product_condition: "new",
    warranty: "",
  });

  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userId) {
      setFormData((prev) => ({
        ...prev,
        user_id: userId,
      }));
    }
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      setError("You can upload a maximum of 5 images.");
      return;
    }

    setError("");

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
    setFormData((prev) => ({ ...prev, property_images: files }));
  };

  const removeImage = (index: number) => {
    const newFiles = [...formData.property_images];
    const newPreviews = [...previews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setFormData((prev) => ({ ...prev, property_images: newFiles }));
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (formData.property_images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    if (!formData.name || !formData.price || !formData.product_description) {
      setError("Please fill in all the required fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const payload = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      if (key === "property_images") {
        formData.property_images.forEach((file) =>
          payload.append("property_images[]", file)
        );
      } else {
        payload.append(key, value.toString());
      }
    }

    try {
      console.log("Submitting form", formData);
      await new Promise((res) => setTimeout(res, 1500)); // Simulated API call
      alert("Ad created successfully!");
      setIsSubmitting(false);
    } catch (err) {
      setError("Failed to submit form. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Create New Ad</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="card">
          <div className="card-body">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="product_description"
                value={formData.product_description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Upload Images (Max 5)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              {previews.length > 0 && (
                <div className="d-flex gap-2 mt-3 flex-wrap">
                  {previews.map((src, index) => (
                    <div key={index} className="position-relative">
                      <Image
                        src={src}
                        width={100}
                        height={100}
                        thumbnail
                        className="me-2"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subcategory</Form.Label>
                  <Form.Select
                    name="subcategory_id"
                    value={formData.subcategory_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    {subcategories
                      .filter((sub) => sub.category_id === Number(formData.category_id))
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
                  <Form.Select
                    name="brand_id"
                    value={formData.brand_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Model</Form.Label>
                  <Form.Select
                    name="model_id"
                    value={formData.model_id}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    {models
                      .filter((m) => m.brand_id === Number(formData.brand_id))
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Condition</Form.Label>
                  <Form.Select
                    name="product_condition"
                    value={formData.product_condition}
                    onChange={handleChange}
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Warranty</Form.Label>
                  <Form.Control
                    type="text"
                    name="warranty"
                    placeholder="e.g. 6 months"
                    value={formData.warranty}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
          </div>

          <div className="card-footer d-flex justify-content-end gap-2">
            <Button type="submit" variant="success" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Create Ad"}
            </Button>
            <Button variant="secondary" href="/ads">Cancel</Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default CreateAdForm;
