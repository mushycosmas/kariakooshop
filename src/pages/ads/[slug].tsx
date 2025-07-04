import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Spinner, Alert, Card, Button, Image } from 'react-bootstrap';
import AdsDetails from '@/components/products/AdsDetails';
import StartChat from '../../components/Buttons/StartChat';
import { Product } from '../../types/Product';
import MainLayout from '@/components/MainLayout';
import SafetyTipsCard  from '@/components/Cards/SafetyTipsCard';

const AdDetail = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [ad, setAd] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchAd = async () => {
      try {
        const res = await axios.get(`/api/ads/${slug}`);
        const enrichedAd = {
          ...res.data,
          seller: {
            name: 'Kariakoo Plus Shop',
            phone: '+255 744 091 391',
            email: 'info@kariakoo.co.tz',
            avatar: '/seller-avatar.jpg', // Optional avatar path
          },
        };
        setAd(enrichedAd);
      } catch (error) {
        console.error('Error fetching ad:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [slug]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (!ad) return <Alert variant="danger" className="mt-4">Ad not found</Alert>;

  return (
    <MainLayout>
      <Container className="mt-4">
        <Row>
          {/* Ad Details */}
          <Col lg={8}>
            <AdsDetails product={ad} />
          </Col>

          {/* Seller Info Sidebar */}
          <Col lg={4}>
            <Card className="shadow-sm border rounded-3 p-3 text-center">
              {/* Avatar */}
              <Image
                src={ad.seller?.avatar || '/default-avatar.png'}
                roundedCircle
                width={80}
                height={80}
                className="mb-3"
                alt="Seller Avatar"
              />
              {/* Seller Info */}
              <h5 className="fw-bold mb-1">{ad.seller?.name}</h5>
              <small className="text-muted">Verified Seller</small>
              <hr />
              <p><i className="bi bi-telephone-fill me-2" />{ad.seller?.phone}</p>
              {ad.seller?.email && (
                <p><i className="bi bi-envelope-fill me-2" />{ad.seller.email}</p>
              )}
                  
              <Button
                variant="success"
                href={`https://wa.me/${ad.seller?.phone.replace(/\s|\+/g, '')}?text=Hi%2C%20I'm%20interested%20in%20your%20product%20${encodeURIComponent(ad.name)}`}
                className="w-100 mt-2"
                target="_blank"
              >
                <i className="bi bi-whatsapp me-2" />
                Chat via WhatsApp
              </Button>
              <StartChat adId={ad.id} productName={ad.name} />

            </Card>
            <SafetyTipsCard />
          </Col>
        </Row>
      </Container>
    </MainLayout>
  );
};

export default AdDetail;
