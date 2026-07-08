"use client";

import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";

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

// Icon mapping for Next.js (Bootstrap Icons)
const iconMap: { [key: string]: string } = {
  'hardware-chip-outline': 'bi-cpu',
  'bag-handle-outline': 'bi-bag',
  'cube-outline': 'bi-cube',
  'shirt-outline': 'bi-hdd-stack', // or bi-shirt
  'phone-portrait-outline': 'bi-phone',
  'cut-outline': 'bi-scissors',
  'briefcase-outline': 'bi-briefcase',
  'hammer-outline': 'bi-hammer',
  'construct-outline': 'bi-tools',
  'basketball-outline': 'bi-dribbble',
  'people-outline': 'bi-people',
  'leaf-outline': 'bi-tree',
  'paw-outline': 'bi-heart', // or bi-paw
};

// Fallback icons for React Native (using emoji)
const fallbackIcons: { [key: string]: string } = {
  'hardware-chip-outline': '💻',
  'bag-handle-outline': '👜',
  'cube-outline': '📦',
  'shirt-outline': '👕',
  'phone-portrait-outline': '📱',
  'cut-outline': '✂️',
  'briefcase-outline': '💼',
  'hammer-outline': '🔨',
  'construct-outline': '🛠️',
  'basketball-outline': '🏀',
  'people-outline': '👥',
  'leaf-outline': '🌿',
  'paw-outline': '🐾',
};

// Get icon class for Bootstrap
const getIconClass = (iconName: string): string => {
  return iconMap[iconName] || 'bi-tag';
};

// Get fallback emoji for React Native
const getFallbackIcon = (iconName: string): string => {
  return fallbackIcons[iconName] || '📦';
};

// Check if icon is in the list
const isValidIcon = (iconName: string): boolean => {
  return iconName in iconMap;
};

// Component to render icon
const CategoryIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className = "" }) => {
  // Check if it's a valid icon from our list
  if (isValidIcon(icon)) {
    // For Next.js, use Bootstrap icons
    return <i className={`bi ${getIconClass(icon)} ${className}`} />;
  }
  
  // For React Native or fallback, use emoji
  return <span className={className}>{getFallbackIcon(icon)}</span>;
};

const CategorySidebar: React.FC<Props> = ({ onSubcategorySelect }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories_sub");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Category loading error", error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  return (
    <div className="category-wrapper">
      <div className="category-card">
        <div className="category-header">
          <div className="category-title">
            <i className="bi bi-grid-3x3-gap-fill" />
            <span>Categories</span>
          </div>
        </div>

        <div className="category-body">
          {loading ? (
            <div className="loading">
              <Spinner animation="border" variant="success" />
            </div>
          ) : (
            <>
              <div
                className="category-item all"
                onClick={() => onSubcategorySelect("all")}
              >
                <span>
                  <i className="bi bi-globe2 me-2" />
                  All Products
                </span>
              </div>

              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="category-item-wrapper"
                  onMouseEnter={() => setHovered(cat.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="category-item">
                    <div>
                      <CategoryIcon icon={cat.icon} className="icon" />
                      {cat.name}
                    </div>
                    {cat.subcategories.length > 0 && (
                      <span className="arrow">›</span>
                    )}
                  </div>

                  {hovered === cat.id && cat.subcategories.length > 0 && (
                    <div className="submenu">
                      <div className="submenu-header">
                        <CategoryIcon icon={cat.icon} />
                        <h6>{cat.name}</h6>
                      </div>

                      {cat.subcategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="submenu-item"
                          onClick={() => onSubcategorySelect(sub.id)}
                        >
                          <span>{sub.name}</span>
                          <i className="bi bi-chevron-right" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .category-wrapper {
          position: sticky;
          top: 90px;
          z-index: 20;
        }

        .category-card {
          background: white;
          border-radius: 18px;
          overflow: visible;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
        }

        .category-header {
          padding: 18px;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          border-radius: 18px 18px 0 0;
          color: white;
        }

        .category-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 800;
        }

        .category-title i {
          font-size: 22px;
        }

        .category-body {
          padding: 12px;
        }

        .loading {
          display: flex;
          justify-content: center;
          padding: 30px;
        }

        .category-item-wrapper {
          position: relative;
        }

        .category-item {
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 15px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.25s;
          color: #334155;
        }

        .category-item:hover {
          background: #f0fdf4;
          color: #15803d;
          transform: translateX(4px);
        }

        .category-item .icon {
          font-size: 20px;
          margin-right: 10px;
          display: inline-block;
        }

        .arrow {
          font-size: 24px;
          color: #94a3b8;
          transition: transform 0.2s ease;
        }

        .category-item:hover .arrow {
          transform: translateX(4px);
          color: #15803d;
        }

        .all {
          background: #f8fafc;
          margin-bottom: 8px;
        }

        .all i {
          font-size: 16px;
        }

        /* SUB MENU */
        .submenu {
          position: absolute;
          left: 100%;
          top: 0;
          width: 260px;
          background: white;
          border-radius: 15px;
          padding: 12px;
          margin-left: 8px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid #e5e7eb;
          animation: slide 0.2s ease;
          z-index: 100;
        }

        .submenu-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 4px 10px 4px;
          border-bottom: 2px solid #f0fdf4;
          margin-bottom: 8px;
        }

        .submenu-header i {
          font-size: 20px;
          color: #16a34a;
        }

        .submenu h6 {
          font-size: 15px;
          font-weight: 700;
          color: #16a34a;
          margin: 0;
        }

        .submenu-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
          color: #334155;
        }

        .submenu-item:hover {
          background: #dcfce7;
          color: #15803d;
        }

        .submenu-item i {
          font-size: 14px;
          color: #94a3b8;
          opacity: 0;
          transition: 0.2s;
        }

        .submenu-item:hover i {
          opacity: 1;
          color: #15803d;
          transform: translateX(4px);
        }

        @keyframes slide {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .category-wrapper {
            position: relative;
            top: 0;
          }

          .submenu {
            display: none;
          }

          .category-item {
            font-size: 13px;
            height: 44px;
          }

          .category-title {
            font-size: 16px;
          }
        }

        /* Tablet */
        @media (min-width: 769px) and (max-width: 992px) {
          .submenu {
            width: 220px;
          }
        }
      `}</style>
    </div>
  );
};

export default CategorySidebar;