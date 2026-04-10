"use client";

import SellerDashboardLayout from "@/components/SellerDashboardLayout";
import { useState, useEffect } from "react";
import {
  Button,
  Form,
  Card,
  ListGroup,
  Row,
  Col,
  Container,
} from "react-bootstrap";

type Subcategory = { id: number; name: string };
type Category = {
  id: number;
  name: string;
  subcategories: Subcategory[];
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [newCategory, setNewCategory] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const [newSubcategory, setNewSubcategory] = useState("");
  const [subEditId, setSubEditId] = useState<{
    catId: number;
    subId: number;
  } | null>(null);
  const [editSubName, setEditSubName] = useState("");

  // Fetch categories + subcategories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      // GET categories with nested subcategories from API
      const res = await fetch("/api/categories");
      const cats: Category[] = await res.json();

      // For each category, fetch its subcategories (or modify API to return nested)
      // If your /api/categories returns nested subcategories, skip below

      // If not nested, fetch subcategories separately and merge here
      const subRes = await fetch("/api/subcategories");
      const subs: { id: number; name: string; category_id: number }[] =
        await subRes.json();

      // Nest subcategories in categories
      const catsWithSubs = cats.map((cat) => ({
        ...cat,
        subcategories: subs.filter((sub) => sub.category_id === cat.id),
      }));

      setCategories(catsWithSubs);
    } catch (error) {
      console.error("Failed to load categories", error);
    } finally {
      setLoading(false);
    }
  }

  // Add Category
  async function addCategory() {
    if (!newCategory.trim()) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory }),
      });
      if (!res.ok) throw new Error("Failed to add category");

      // Refresh categories from API
      await fetchCategories();
      setNewCategory("");
    } catch (err) {
      alert((err as Error).message);
    }
  }

  // Delete Category
  async function deleteCategory(id: number) {
    if (!confirm("Delete this category?")) return;

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete category");

      await fetchCategories();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  // Update Category
  async function updateCategory() {
    if (!editCategoryId || !editCategoryName.trim()) return;

    try {
      const res = await fetch(`/api/categories?id=${editCategoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editCategoryName }),
      });
      if (!res.ok) throw new Error("Failed to update category");

      await fetchCategories();
      setEditCategoryId(null);
      setEditCategoryName("");
    } catch (err) {
      alert((err as Error).message);
    }
  }

  // Add Subcategory
  async function addSubcategory(catId: number) {
    if (!newSubcategory.trim()) return;

    try {
      const res = await fetch("/api/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSubcategory,
          category_id: catId,
        }),
      });
      if (!res.ok) throw new Error("Failed to add subcategory");

      await fetchCategories();
      setNewSubcategory("");
    } catch (err) {
      alert((err as Error).message);
    }
  }

  // Delete Subcategory
  async function deleteSubcategory(catId: number, subId: number) {
    if (!confirm("Delete this subcategory?")) return;

    try {
      const res = await fetch(`/api/subcategories?id=${subId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete subcategory");

      await fetchCategories();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  // Update Subcategory
  async function updateSubcategory() {
    if (!subEditId || !editSubName.trim()) return;

    try {
      const res = await fetch(`/api/subcategories?id=${subEditId.subId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editSubName,
          category_id: subEditId.catId,
        }),
      });
      if (!res.ok) throw new Error("Failed to update subcategory");

      await fetchCategories();
      setSubEditId(null);
      setEditSubName("");
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <SellerDashboardLayout>
      <Container className="py-4">
        <h2 className="mb-4">Manage Categories</h2>

        <Row className="mb-4">
          <Col sm={9}>
            <Form.Control
              placeholder="New Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              disabled={loading}
            />
          </Col>
          <Col sm={3}>
            <Button onClick={addCategory} variant="primary" className="w-100" disabled={loading}>
              Add Category
            </Button>
          </Col>
        </Row>

        {loading ? (
          <p>Loading...</p>
        ) : (
          categories.map((cat) => (
            <Card key={cat.id} className="mb-4">
              <Card.Body>
                {editCategoryId === cat.id ? (
                  <Row className="mb-2">
                    <Col sm={9}>
                      <Form.Control
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        disabled={loading}
                      />
                    </Col>
                    <Col sm={3}>
                      <Button
                        variant="success"
                        onClick={updateCategory}
                        className="me-2"
                        disabled={loading}
                      >
                        Save
                      </Button>
                      <Button variant="secondary" onClick={() => setEditCategoryId(null)} disabled={loading}>
                        Cancel
                      </Button>
                    </Col>
                  </Row>
                ) : (
                  <Row className="align-items-center mb-2">
                    <Col>
                      <strong>{cat.name}</strong>
                    </Col>
                    <Col sm="auto">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          setEditCategoryId(cat.id);
                          setEditCategoryName(cat.name);
                        }}
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => deleteCategory(cat.id)}
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </Col>
                  </Row>
                )}

                <ListGroup className="mb-3">
                  {cat.subcategories.map((sub) => (
                    <ListGroup.Item
                      key={sub.id}
                      className="d-flex justify-content-between"
                    >
                      {subEditId?.catId === cat.id && subEditId.subId === sub.id ? (
                        <>
                          <Form.Control
                            value={editSubName}
                            onChange={(e) => setEditSubName(e.target.value)}
                            className="me-2"
                            disabled={loading}
                          />
                          <Button
                            variant="success"
                            size="sm"
                            onClick={updateSubcategory}
                            className="me-2"
                            disabled={loading}
                          >
                            Save
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSubEditId(null)}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <div>{sub.name}</div>
                          <div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => {
                                setSubEditId({ catId: cat.id, subId: sub.id });
                                setEditSubName(sub.name);
                              }}
                              disabled={loading}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => deleteSubcategory(cat.id, sub.id)}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>

                <Row>
                  <Col sm={9}>
                    <Form.Control
                      placeholder="New Subcategory"
                      value={newSubcategory}
                      onChange={(e) => setNewSubcategory(e.target.value)}
                      disabled={loading}
                    />
                  </Col>
                  <Col sm={3}>
                    <Button
                      onClick={() => addSubcategory(cat.id)}
                      variant="info"
                      className="w-100"
                      disabled={loading}
                    >
                      Add Subcategory
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))
        )}
      </Container>
    </SellerDashboardLayout>
  );
}
