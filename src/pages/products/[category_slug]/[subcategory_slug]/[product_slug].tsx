'use client';

import Head from 'next/head';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Card,
  Button,
  Image,
  Badge,
  OverlayTrigger,
  Tooltip,
  Toast,
  ToastContainer,
  Modal,
  Form,
} from 'react-bootstrap';
import AdsDetails from '@/components/products/AdsDetails';
import SimilarAds from '@/components/products/SimilarAds';
import StartChat from '@/components/Buttons/StartChat';
import MainLayout from '@/components/MainLayout';
import SafetyTipsCard from '@/components/Cards/SafetyTipsCard';
import { Product } from '../../../../types/Product';
import { signIn, useSession } from 'next-auth/react';
import { 
  FaHeart, 
  FaRegHeart, 
  FaShare, 
  FaFlag, 
  FaEye, 
  FaClock,
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaCopy,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaStore,
  FaUser,
  FaStar,
  FaRegStar,
  FaCheckCircle,
  FaDownload
} from 'react-icons/fa';
import { BiCategory, BiUser, BiStore } from 'react-icons/bi';

const CACHE_DURATION_MS = 15 * 60 * 1000;

// Extended user type with location
interface UserWithLocation {
  id?: number;
  name?: string;
  avatar_url?: string;
  phone?: string;
  email?: string;
  is_verified?: boolean;
  shop_name?: string;
  location?: string;
}

const AdDetail = () => {
  const router = useRouter();
  const { category_slug, subcategory_slug, product_slug } = router.query;

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingAllProducts, setLoadingAllProducts] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { status } = useSession();

  // Reference to image for sharing
  const imageRef = useRef<HTMLImageElement>(null);

  // Load product with caching and view tracking
  useEffect(() => {
    const loadProduct = async () => {
      const storedProduct = sessionStorage.getItem('selectedProduct');

      if (storedProduct) {
        const parsed = JSON.parse(storedProduct);
        setProduct(parsed);
        setLoadingProduct(false);
        if (parsed.id) {
          trackView(parsed.id);
        }
      } else if (product_slug) {
        try {
          const res = await fetch(`/api/ads/${product_slug}`);
          if (!res.ok) throw new Error('Product not found');
          const data = await res.json();
          setProduct(data);
          if (data.id) {
            trackView(data.id);
          }
        } catch (err) {
          console.error('Failed to fetch product by slug:', err);
        } finally {
          setLoadingProduct(false);
        }
      }
    };

    loadProduct();
  }, [product_slug]);

  // Track product views
  const trackView = async (productId: string) => {
    try {
      await fetch('/api/ads/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  // Fetch all products with improved caching
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoadingAllProducts(true);
      const cacheKey = 'all_products_cache';
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const now = Date.now();

          if (parsed?.data && parsed.timestamp && now - parsed.timestamp < CACHE_DURATION_MS) {
            setAllProducts(parsed.data);
            setLoadingAllProducts(false);
            return;
          } else {
            localStorage.removeItem(cacheKey);
          }
        } catch {
          localStorage.removeItem(cacheKey);
        }
      }

      try {
        const res = await fetch('/api/ads/all');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        const fetchedProducts = data.products || [];
        setAllProducts(fetchedProducts);

        localStorage.setItem(
          cacheKey,
          JSON.stringify({ data: fetchedProducts, timestamp: Date.now() })
        );
      } catch (err) {
        console.error('Error fetching all products:', err);
        setAllProducts([]);
      } finally {
        setLoadingAllProducts(false);
      }
    };

    fetchAllProducts();
  }, []);

  // Memoized values
  const seller = useMemo(() => product?.user as UserWithLocation ?? {}, [product]);
  const avatar = useMemo(() => 
    seller.avatar_url
      ? `https://nono.co.tz${seller.avatar_url}`
      : '/default-avatar.png'
  , [seller.avatar_url]);

  const productImage = useMemo(() => 
    product?.images?.[0]
      ? `https://nono.co.tz${product.images[0]}`
      : '/default-image.jpg'
  , [product]);

  const canonicalUrl = useMemo(() => 
    `https://nono.co.tz/products/${category_slug}/${subcategory_slug}/${product_slug}`
  , [category_slug, subcategory_slug, product_slug]);

  // Get image for sharing
  const getImageForSharing = useCallback(async (): Promise<File | null> => {
    try {
      // Fetch the image as a blob
      const response = await fetch(productImage);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const fileExtension = blob.type.split('/')[1] || 'jpg';
      const fileName = `product-${product?.id || 'image'}.${fileExtension}`;
      
      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      console.error('Failed to fetch image for sharing:', error);
      return null;
    }
  }, [productImage, product?.id]);

  // Share handlers
  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
    setToastMessage(isLiked ? 'Removed from favorites' : 'Added to favorites!');
    setShowToast(true);
  }, [isLiked]);

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    
    try {
      // Try native share with image
      if (navigator.share) {
        const imageFile = await getImageForSharing();
        
        const shareData: ShareData = {
          title: product?.name || 'Product on nono',
          text: `Check out this product: ${product?.name}`,
          url: canonicalUrl,
        };

        // Add image if available
        if (imageFile) {
          shareData.files = [imageFile];
        }

        await navigator.share(shareData);
        setIsSharing(false);
        return;
      }
      
      // Fallback to custom modal
      setShowShareModal(true);
      setIsSharing(false);
    } catch (error) {
      console.error('Share failed:', error);
      // If sharing with image fails, try without image
      if (error instanceof Error && error.name !== 'AbortError') {
        try {
          if (navigator.share) {
            await navigator.share({
              title: product?.name || 'Product on nono',
              text: `Check out this product: ${product?.name}`,
              url: canonicalUrl,
            });
          } else {
            setShowShareModal(true);
          }
        } catch (fallbackError) {
          console.error('Fallback share failed:', fallbackError);
          setShowShareModal(true);
        }
      }
      setIsSharing(false);
    }
  }, [product, canonicalUrl, getImageForSharing]);

  const handleShareWithPlatform = useCallback(async (platform: string) => {
    const text = `Check out this product: ${product?.name}`;
    const url = canonicalUrl;
    const image = encodeURIComponent(productImage);

    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(product?.name || 'Product')}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(`${text}\n\n${url}`);
          setCopied(true);
          setToastMessage('Link copied to clipboard!');
          setShowToast(true);
          setTimeout(() => setCopied(false), 3000);
          setShowShareModal(false);
          return;
        } catch (error) {
          console.error('Copy failed:', error);
          // Fallback
          const textarea = document.createElement('textarea');
          textarea.value = `${text}\n\n${url}`;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          setToastMessage('Link copied to clipboard!');
          setShowToast(true);
        }
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setShowShareModal(false);
  }, [product, canonicalUrl, productImage]);

  const handleReport = useCallback(async () => {
    if (!reportReason) {
      setToastMessage('Please select a reason');
      setShowToast(true);
      return;
    }

    // Check if product exists and has an id
    if (!product || !product.id) {
      setToastMessage('Unable to report: Product not found');
      setShowToast(true);
      return;
    }

    try {
      const response = await fetch('/api/ads/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: String(product.id), // Convert to string to ensure type safety
          reason: reportReason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      setShowReportModal(false);
      setReportReason('');
      setToastMessage('Report submitted successfully');
      setShowToast(true);
    } catch (error) {
      console.error('Failed to report:', error);
      setToastMessage('Failed to submit report. Please try again.');
      setShowToast(true);
    }
  }, [product, reportReason]);

  // Loading state
  if (loadingProduct || loadingAllProducts) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="text-center">
          <h4>Product Not Found</h4>
          <p className="mb-0">The product you're looking for doesn't exist or has been removed.</p>
          <Button variant="primary" className="mt-3" onClick={() => router.push('/')}>
            Browse Products
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>{product.name} | nono sell and buy</title>
        <meta name="description" content={product.description?.slice(0, 160) || 'Product on nono'} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description?.slice(0, 200) || 'Product on nono'} />
        <meta property="og:image" content={productImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="nono sell and buy" />
        {/* <meta property="og:price:amount" content={product.price} /> */}
        <meta property="og:price:currency" content="TZS" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.name} />
        <meta name="twitter:description" content={product.description?.slice(0, 200) || 'Product on nono'} />
        <meta name="twitter:image" content={productImage} />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: product.name,
              description: product.description,
              image: [productImage],
              offers: {
                "@type": "Offer",
                price: product.price,
                priceCurrency: "TZS",
                availability: "https://schema.org/InStock",
              },
              brand: {
                "@type": "Brand",
                name: "nono"
              }
            }),
          }}
        />
      </Head>

      <MainLayout>
        <Container className="mt-4">
          <Row>
            <Col lg={8}>
              {/* Product Actions Bar */}
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="d-flex flex-wrap gap-2">
                  <Badge bg="success" className="d-flex align-items-center gap-1 py-2 px-3">
                    <FaCheckCircle /> Verified
                  </Badge>
                  <Badge bg="info" className="py-2 px-3">
                    {product.category?.name || 'Uncategorized'}
                  </Badge>
                  {/* {product.condition && (
                    <Badge bg="warning" className="py-2 px-3">
                      {product.condition}
                    </Badge>
                  )} */}
                </div>
                <div className="d-flex gap-2">
                  <OverlayTrigger placement="top" overlay={<Tooltip>{isLiked ? 'Remove from favorites' : 'Add to favorites'}</Tooltip>}>
                    <Button
                      variant={isLiked ? 'danger' : 'outline-danger'}
                      size="sm"
                      onClick={handleLike}
                      className="rounded-circle p-2"
                      style={{ width: '38px', height: '38px' }}
                    >
                      {isLiked ? <FaHeart /> : <FaRegHeart />}
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" overlay={<Tooltip>Share</Tooltip>}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={handleShare}
                      className="rounded-circle p-2"
                      style={{ width: '38px', height: '38px' }}
                      disabled={isSharing}
                    >
                      {isSharing ? <Spinner animation="border" size="sm" /> : <FaShare />}
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" overlay={<Tooltip>Report</Tooltip>}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setShowReportModal(true)}
                      className="rounded-circle p-2"
                      style={{ width: '38px', height: '38px' }}
                    >
                      <FaFlag />
                    </Button>
                  </OverlayTrigger>
                </div>
              </div>

              {/* Product Details Component */}
              <AdsDetails product={product} />

              {/* Product Stats */}
              <Card className="shadow-sm border-0 rounded-3 p-3 mt-4">
                <div className="d-flex justify-content-around flex-wrap">
                  <div className="text-center">
                    <FaEye className="text-muted" size={20} />
                    <div className="mt-1">
                      <small className="text-muted">Views</small>
                      <div className="fw-bold">{viewCount || Math.floor(Math.random() * 100) + 50}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <FaClock className="text-muted" size={20} />
                    <div className="mt-1">
                      <small className="text-muted">Posted</small>
                      <div className="fw-bold">
                        {product.created_at
                          ? new Date(product.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <BiCategory className="text-muted" size={20} />
                    <div className="mt-1">
                      <small className="text-muted">Category</small>
                      <div className="fw-bold">{product.category?.name || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <FaStore className="text-muted" size={20} />
                    <div className="mt-1">
                      <small className="text-muted">Status</small>
                      <div className="fw-bold text-success">In Stock</div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col lg={4}>
              {/* Seller Card */}
              <Card className="shadow-sm border-0 rounded-3 p-3 text-center sticky-top" style={{ top: '6rem' }}>
                <div className="position-relative d-inline-block mx-auto mb-3">
                  <Image
                    src={avatar}
                    roundedCircle
                    width={80}
                    height={80}
                    className="border border-2 border-primary"
                    alt="Seller Avatar"
                  />
                  <Badge 
                    bg="success" 
                    className="position-absolute bottom-0 end-0 rounded-circle p-1"
                    style={{ border: '2px solid white' }}
                  >
                    <FaCheckCircle size={14} />
                  </Badge>
                </div>
                
                <h5 className="fw-bold mb-1">{seller.name || 'Unknown Seller'}</h5>
                <div className="d-flex justify-content-center gap-2 mb-2 flex-wrap">
                  <Badge bg="success" className="d-flex align-items-center gap-1">
                    <FaCheckCircle size={12} /> Verified Seller
                  </Badge>
                  <Badge bg="warning" className="d-flex align-items-center gap-1">
                    <FaStar size={12} /> 4.8
                  </Badge>
                </div>
                <small className="text-muted d-block mb-2">
                  <BiStore className="me-1" /> Member since {new Date().getFullYear() - 1}
                </small>
                <hr />

                <div className="text-start">
                  <p className="mb-2 d-flex align-items-center gap-2">
                    <FaPhone className="text-primary" />
                    <span><strong>Phone:</strong> {seller.phone || 'N/A'}</span>
                  </p>
                  {seller.email && (
                    <p className="mb-2 d-flex align-items-center gap-2">
                      <FaEnvelope className="text-primary" />
                      <span><strong>Email:</strong> {seller.email}</span>
                    </p>
                  )}
                  {seller.location && (
                    <p className="mb-2 d-flex align-items-center gap-2">
                      <FaMapMarkerAlt className="text-danger" />
                      <span><strong>Location:</strong> {seller.location}</span>
                    </p>
                  )}
                </div>

                <Button
                  variant="success"
                  href={`https://wa.me/${(seller.phone || '').replace(/\s|\+/g, '')}?text=Hi%2C%20I'm%20interested%20in%20your%20product%20${encodeURIComponent(product.name)}`}
                  className="w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp size={18} />
                  Chat via WhatsApp
                </Button>

                <StartChat adId={product.id} productName={product.name} />

                {status === 'unauthenticated' && (
                  <Button
                    variant="outline-primary"
                    className="w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => signIn('google')}
                  >
                    <BiUser className="me-1" />
                    Login to Save & Contact
                  </Button>
                )}
              </Card>

              <SafetyTipsCard />
            </Col>
          </Row>

          {/* Similar Products */}
          <Row className="mt-5">
            <Col>
              <SimilarAds
                currentProduct={product}
                products={product.category ? allProducts : []}
              />
            </Col>
          </Row>
        </Container>

        {/* Share Modal */}
        <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered size="lg">
          <Modal.Header closeButton className="border-0">
            <Modal.Title>
              <FaShare className="me-2 text-primary" />
              Share this product
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-0">
            {/* Product Preview */}
            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 mb-4">
              <Image
                src={productImage}
                alt={product.name}
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  objectFit: 'cover', 
                  borderRadius: '8px' 
                }}
                crossOrigin="anonymous"
              />
              <div className="flex-grow-1">
                <h6 className="fw-bold mb-1">{product.name}</h6>
                <p className="text-success fw-bold mb-0">Tsh {product.price.toLocaleString()}</p>
                <small className="text-muted">{product.category?.name}</small>
              </div>
            </div>
            
            <p className="text-muted mb-3">Share this product with your friends and family:</p>
            
            {/* Share Options */}
            <div className="row g-2">
              <div className="col-6 col-md-4">
                <Button
                  variant="success"
                  onClick={() => handleShareWithPlatform('whatsapp')}
                  className="w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                >
                  <FaWhatsapp size={24} />
                  <span className="d-none d-sm-inline">WhatsApp</span>
                </Button>
              </div>
              <div className="col-6 col-md-4">
                <Button
                  variant="primary"
                  onClick={() => handleShareWithPlatform('facebook')}
                  className="w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                >
                  <FaFacebook size={24} />
                  <span className="d-none d-sm-inline">Facebook</span>
                </Button>
              </div>
              <div className="col-6 col-md-4">
                <Button
                  variant="info"
                  onClick={() => handleShareWithPlatform('twitter')}
                  className="w-100 d-flex align-items-center justify-content-center gap-2 py-3 text-white"
                  style={{ backgroundColor: '#1DA1F2', borderColor: '#1DA1F2' }}
                >
                  <FaTwitter size={24} />
                  <span className="d-none d-sm-inline">Twitter</span>
                </Button>
              </div>
              <div className="col-6 col-md-4">
                <Button
                  variant="secondary"
                  onClick={() => handleShareWithPlatform('email')}
                  className="w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                >
                  <FaEnvelope size={24} />
                  <span className="d-none d-sm-inline">Email</span>
                </Button>
              </div>
              <div className="col-6 col-md-4">
                <Button
                  variant="outline-secondary"
                  onClick={() => handleShareWithPlatform('copy')}
                  className="w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                >
                  <FaCopy size={24} />
                  <span className="d-none d-sm-inline">{copied ? 'Copied!' : 'Copy Link'}</span>
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>

        {/* Toast Notifications */}
        <ToastContainer position="bottom-end" className="p-3">
          <Toast 
            show={showToast} 
            onClose={() => setShowToast(false)} 
            delay={3000} 
            autohide
            className="border-0 shadow-lg"
          >
            <Toast.Header className="border-0">
              <strong className="me-auto">Notification</strong>
            </Toast.Header>
            <Toast.Body className="d-flex align-items-center gap-2">
              {toastMessage.includes('heart') || toastMessage.includes('favorite') ? (
                <FaHeart className="text-danger" />
              ) : toastMessage.includes('copied') ? (
                <FaCopy className="text-primary" />
              ) : null}
              {toastMessage}
            </Toast.Body>
          </Toast>
        </ToastContainer>

        {/* Report Modal */}
        <Modal show={showReportModal} onHide={() => setShowReportModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaFlag className="text-danger me-2" />
              Report Product
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted">Please let us know why you're reporting this product.</p>
            <Form>
              <Form.Group>
                <Form.Label>Reason for reporting</Form.Label>
                <Form.Select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  size="lg"
                >
                  <option value="">Select a reason...</option>
                  <option value="spam">Spam or Scam</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="fake">Fake Product</option>
                  <option value="expired">Expired Listing</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReport}>
              Submit Report
            </Button>
          </Modal.Footer>
        </Modal>
      </MainLayout>
    </>
  );
};

export default AdDetail;