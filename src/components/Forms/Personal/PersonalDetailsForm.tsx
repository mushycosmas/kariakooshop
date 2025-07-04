'use client';

import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Container, Image } from 'react-bootstrap';

export default function PersonalDetailsForm() {
  const customerId = 1; // hardcoded for demo

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('Kinondoni');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('Male');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const regions = [
    'Arusha Region', 'Dar es Salaam', 'Mwanza Region', 'Dodoma Region',
    'Geita Region', 'Iringa Region', 'Kagera Region', 'Katavi Region',
    'Kigoma Region', 'Kilimanjaro Region', 'Lindi Region', 'Manyara Region',
    'Mara Region', 'Mbeya Region', 'Morogoro Region', 'Mtwara Region',
    'Njombe Region', 'Pemba North Region', 'Pemba South Region',
    'Pwani Region', 'Rukwa Region', 'Ruvuma Region', 'Shinyanga Region',
    'Shinyanga Rural', 'Simiyu Region', 'Singida Region', 'Tabora Region',
    'Tanga Region', 'Zanzibar'
  ];

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/get-user/${customerId}`);
        if (!res.ok) throw new Error('Failed to fetch user');
        const { user } = await res.json();

        setFirstName(user.first_name ?? '');
        setLastName(user.last_name ?? '');
        setLocation(user.location ?? 'Kinondoni');
        setBirthday(user.birthday?.split('T')[0] ?? '');
        setGender(user.gender ?? 'Male');
        setPhone(user.phone ?? '');
        setEmail(user.email ?? '');
        setAddress(user.address ?? '');
        if (user.avatar_url) setAvatarPreview(user.avatar_url);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchUser();
  }, [customerId]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('id', customerId);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('location', location);
      formData.append('birthday', birthday);
      formData.append('gender', gender);
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('address', address);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await fetch('/api/save-details', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Details saved successfully!');
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setError('Network error or server issue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Personal Details</h2>
      {success && <p className="text-success">{success}</p>}
      {error && <p className="text-danger">{error}</p>}

      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="firstName">
              <Form.Label>First Name*</Form.Label>
              <Form.Control
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="lastName">
              <Form.Label>Last Name*</Form.Label>
              <Form.Control
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3" controlId="location">
          <Form.Label>Location*</Form.Label>
          <Form.Select value={location} onChange={(e) => setLocation(e.target.value)} required>
            {regions.map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="birthday">
              <Form.Label>Birthday</Form.Label>
              <Form.Control
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="gender">
              <Form.Label>Sex</Form.Label>
              <Form.Select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Do not specify">Do not specify</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3" controlId="avatar">
          <Form.Label>Avatar</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={handleAvatarChange} />
          {avatarPreview && (
            <div className="mt-2">
              <Image src={avatarPreview} roundedCircle width={80} height={80} alt="Avatar preview" />
            </div>
          )}
        </Form.Group>

        <h4 className="mt-4 mb-3">Contact Details</h4>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="phone">
              <Form.Label>Phone Number*</Form.Label>
              <Form.Control
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="e.g. +255 712 345 678"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="email">
              <Form.Label>Email Address*</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="e.g. example@email.com"
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3" controlId="address">
          <Form.Label>Physical Address</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, ward, district..."
          />
        </Form.Group>

        <Button variant="success" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </Form>
    </Container>
  );
}
