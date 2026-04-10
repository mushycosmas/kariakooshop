"use client";

import { useEffect, useState } from "react";
import { ListGroup, Spinner } from "react-bootstrap";

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
}

interface Props {
  onSubcategorySelect: (subcategoryId: string) => void;
}

const CategorySidebar: React.FC<Props> = ({ onSubcategorySelect }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories_sub");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

 const styles: { [key: string]: React.CSSProperties } = {
  stickyWrapper: {
    position: "sticky",
    top: 80,
    zIndex: 10,
  },
  sidebarBox: {
    border: "1px solid #dee2e6",
    borderRadius: "0.5rem",
    backgroundColor: "#fff",
    padding: "1rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  sidebarItem: {
    position: "relative",
  },
  submenu: {
    position: "absolute",
    top: 0,
    left: "100%",
    minWidth: "200px",
    maxHeight: "300px",
    overflowY: "auto", // this will now be valid
    backgroundColor: "#fff",
    border: "1px solid #dee2e6",
    zIndex: 1000,
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
};

  return (
    <div style={styles.stickyWrapper}>
      <div style={styles.sidebarBox}>
        <h5 className="mb-3">All Categories</h5>

        {loading ? (
          <div className="text-center my-3">
            <Spinner animation="border" size="sm" />
          </div>
        ) : (
          <ListGroup variant="flush">
            {/* "All" Option */}
            <ListGroup.Item
              action
              style={{ ...styles.listItem, fontWeight: "bold" }}
              onClick={() => onSubcategorySelect("all")}
            >
              <span>🌍 All</span>
            </ListGroup.Item>

            {/* Loop through categories */}
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                style={styles.sidebarItem}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <ListGroup.Item action style={styles.listItem}>
                  <span>
                    <span className="me-2">{cat.icon}</span> {cat.name}
                  </span>
                  <span>&raquo;</span>
                </ListGroup.Item>

                {hoveredIndex === index && cat.subcategories.length > 0 && (
                  <div style={styles.submenu}>
                    <ListGroup>
                      {cat.subcategories.map((sub) => (
                        <ListGroup.Item
                          key={sub.id}
                          action
                          onClick={() => onSubcategorySelect(sub.id)}
                        >
                          {sub.name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
              </div>
            ))}
          </ListGroup>
        )}
      </div>
    </div>
  );
};

export default CategorySidebar;
