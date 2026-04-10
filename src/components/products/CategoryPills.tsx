"use client";

import React, { useState, useEffect } from "react";
import { Button, ButtonGroup, Spinner } from "react-bootstrap";

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

interface CategoryPillsProps {
  categories?: Category[]; // Pass categories with nested subcategories
  onSelectCategory?: (categoryId: string) => void;
  onSelectSubcategory?: (subcategoryId: string) => void;
}

const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories = [],
  onSelectCategory,
  onSelectSubcategory,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  // If you want, add a built-in loading state to simulate fetch
  // For now assume categories are passed as props

  // Handle selecting a category pill
  const handleCategorySelect = (id: string) => {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId(null); // Reset subcategory when changing category
    onSelectCategory && onSelectCategory(id);
  };

  // Handle selecting a subcategory pill
  const handleSubcategorySelect = (id: string) => {
    setSelectedSubcategoryId(id);
    onSelectSubcategory && onSelectSubcategory(id);
  };

  // Show subcategories for selected category except for "all"
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <>
      <ButtonGroup className="mb-2 flex-wrap gap-2 d-none d-md-flex">
        {/* Always show "All" */}
        <Button
          key="all"
          variant={selectedCategoryId === "all" ? "primary" : "outline-primary"}
          className="rounded-pill"
          onClick={() => handleCategorySelect("all")}
        >
          All
        </Button>

        {/* Show category pills */}
        {categories.map(({ id, name }) => (
          <Button
            key={id}
            variant={selectedCategoryId === id ? "primary" : "outline-primary"}
            className="rounded-pill"
            onClick={() => handleCategorySelect(id)}
          >
            {name}
          </Button>
        ))}
      </ButtonGroup>

      {/* Show subcategories only if category selected and not "all" */}
      {selectedCategoryId !== "all" && selectedCategory?.subcategories && (
        <ButtonGroup className="mb-4 flex-wrap gap-2 d-none d-md-flex">
          {selectedCategory.subcategories.length === 0 ? (
            <div className="text-muted">No subcategories</div>
          ) : (
            selectedCategory.subcategories.map(({ id, name }) => (
              <Button
                key={id}
                variant={selectedSubcategoryId === id ? "primary" : "outline-primary"}
                className="rounded-pill"
                onClick={() => handleSubcategorySelect(id)}
              >
                {name}
              </Button>
            ))
          )}
        </ButtonGroup>
      )}
    </>
  );
};

export default CategoryPills;
