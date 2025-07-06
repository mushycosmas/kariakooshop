"use client";

import { useState, useEffect } from "react";
import SellerDashboardLayout from "@/components/SellerDashboardLayout";
import MessageChat from "@/components/Forms/Message/MessageChat";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import ConversationsList from "@/components/Forms/Message/ConversationsList";
import axios from "axios";

interface Conversation {
  conversationId: number;
  adId: number;
  adName: string;
  adBrand: string;
  adPrice: string;
  adImage: string | null;

  buyerId: number;
  buyerName: string;
  buyerAvatar: string | null;

  sellerId: number;
  sellerName: string;
  sellerAvatar: string | null;

  lastMessageText?: string;
  updated_at: string;
}

const currentUserId = 2; // Replace with actual logged-in user ID

const Page: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`/api/chat/conversations?userId=${currentUserId}`);
        setConversations(res.data);
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return (
    <SellerDashboardLayout>
      <Container fluid className="mt-4" style={{ minHeight: "80vh" }}>
        <Row>
          <Col md={4}>
            <h4>Your Conversations</h4>
            {loading ? (
              <Spinner animation="border" />
            ) : (
              <ConversationsList
                currentUserId={currentUserId}
                conversations={conversations}
                onSelectConversation={setSelectedConversation}
              />
            )}
          </Col>

          <Col md={8}>
            {selectedConversation ? (
              <MessageChat
                conversationId={selectedConversation.conversationId}
                currentUserId={currentUserId}
                product={{
                  id: selectedConversation.adId,
                  name: selectedConversation.adName,
                  brand: selectedConversation.adBrand,
                  price: selectedConversation.adPrice,
                  image: selectedConversation.adImage || "/default-image.png", // ✅ Ensure a string is passed
                }}
              />
            ) : (
              <p>Select a conversation to start chatting.</p>
            )}
          </Col>
        </Row>
      </Container>
    </SellerDashboardLayout>
  );
};

export default Page;
