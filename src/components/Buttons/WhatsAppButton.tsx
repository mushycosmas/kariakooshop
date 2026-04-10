// src/components/WhatsAppButton.tsx
"use client"
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa'; // You can use FaWhatsapp icon from react-icons
import { Button } from 'react-bootstrap';

const WhatsAppButton: React.FC = () => {
  const handleClick = () => {
    // Predefined phone number, you can replace this with your own WhatsApp number
    const phoneNumber = '255744091391'; // Example phone number
    const message = 'Hello! I need assistance.'; // Predefined message

    // URL for WhatsApp with prefilled message
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp chat in a new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      variant="success"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        borderRadius: '50%',
        padding: '15px',
        zIndex: 1000,
      }}
      onClick={handleClick}
    >
      <FaWhatsapp size={30} color="white" />
    </Button>
  );
};

export default WhatsAppButton;
