'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Form,
} from 'react-bootstrap';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSearch?: (query: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  onSearch,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to clear search
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
        inputRef.current?.blur();
      }
      // Enter to search
      if (e.key === 'Enter' && searchQuery.trim() && onSearch) {
        e.preventDefault();
        onSearch(searchQuery.trim());
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, setSearchQuery, onSearch]);

  const handleClear = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  return (
    <section className="hero-section">
      <div className="shape shape-one"></div>
      <div className="shape shape-two"></div>

      <Container className="hero-container">
        <div className="hero-content">
          <h2 className="hero-title">
            Buy Everything.
            <br />
            <span>Retail or Bulk</span>
          </h2>

          <p className="hero-description">
            Discover quality products, affordable prices,
            wholesale deals and fast delivery.
          </p>

          {/* SEARCH */}
          <div className="search-wrapper">
            <div className={`search-container ${isFocused ? 'focused' : ''}`}>
              <div className="search-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </div>

              <Form.Control
                ref={inputRef}
                type="text"
                placeholder="Search products, brands, categories... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Auto-search on typing (optional)
                  if (onSearch && e.target.value.trim()) {
                    onSearch(e.target.value.trim());
                  }
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                aria-label="Search products"
                className="search-input"
              />

              {searchQuery && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={handleClear}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </Container>

      <style jsx>{`
        .hero-section {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #16a34a, #22c55e, #15803d);
          border-radius: 0 0 45px 45px;
          color: white;
          padding-bottom: 20px;
        }

        .hero-container {
          padding: 70px 20px 65px;
          position: relative;
          z-index: 2;
        }

        .hero-content {
          max-width: 850px;
          margin: auto;
          text-align: center;
        }

        .hero-title {
          margin-top: 28px;
          font-size: 44px;
          line-height: 1.15;
          font-weight: 900;
          margin-bottom: 20px;
        }

        .hero-title span {
          color: #dcfce7;
        }

        .hero-description {
          font-size: 17px;
          max-width: 600px;
          margin: 0 auto 40px;
          opacity: 0.9;
        }

        /* SEARCH */
        .search-wrapper {
          max-width: 780px;
          margin: 0 auto;
          padding: 0 10px;
        }

        .search-container {
          background: white;
          padding: 4px 4px 4px 20px;
          border-radius: 70px;
          display: flex;
          align-items: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
          transition: all 0.3s ease;
          border: 2px solid transparent;
          margin-bottom: 10px;
        }

        .search-container.focused {
          border-color: #16a34a;
          box-shadow: 0 20px 50px rgba(22, 163, 74, 0.3);
          transform: translateY(-3px);
        }

        .search-container:hover {
          transform: translateY(-3px);
        }

        .search-icon {
          color: #64748b;
          display: flex;
          flex-shrink: 0;
        }

        .search-input {
          height: 58px;
          border: none !important;
          box-shadow: none !important;
          font-size: 16px;
          padding-left: 15px;
          background: transparent;
          color: #1a202c;
          flex: 1;
        }

        .search-input::placeholder {
          color: #94a3b8;
        }

        .search-input:focus {
          outline: none;
          box-shadow: none;
        }

        .clear-search {
          border: none;
          background: #e2e8f0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .clear-search:hover {
          background: #cbd5e1;
        }

        /* SHAPES */
        .shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
        }

        .shape-one {
          width: 320px;
          height: 320px;
          right: -100px;
          top: -120px;
        }

        .shape-two {
          width: 250px;
          height: 250px;
          left: -100px;
          bottom: -100px;
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .hero-section {
            padding-bottom: 10px;
          }

          .hero-container {
            padding: 45px 15px 55px;
          }

          .hero-title {
            font-size: 30px;
            margin-bottom: 15px;
          }

          .hero-description {
            font-size: 14px;
            margin-bottom: 30px;
          }

          .search-wrapper {
            padding: 0 5px;
          }

          .search-container {
            padding: 4px 4px 4px 16px;
            border-radius: 50px;
            margin-bottom: 8px;
          }

          .search-input {
            height: 50px;
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .hero-container {
            padding: 35px 12px 45px;
          }

          .hero-title {
            font-size: 24px;
            margin-bottom: 12px;
          }

          .hero-description {
            font-size: 13px;
            margin-bottom: 25px;
          }

          .search-wrapper {
            padding: 0;
          }

          .search-container {
            padding: 4px 4px 4px 12px;
            border-radius: 40px;
            margin-bottom: 6px;
          }

          .search-input {
            height: 44px;
            font-size: 13px;
            padding-left: 10px;
          }

          .clear-search {
            width: 26px;
            height: 26px;
            font-size: 16px;
            margin-right: 4px;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;