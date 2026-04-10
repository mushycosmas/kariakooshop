"use client";

import { useEffect, useState } from "react";
import { ListGroup, Spinner, Alert, Image } from "react-bootstrap";

const ConversationsList = ({currentUserId, onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/chat/conversations?userId=${currentUserId}`);
        if (!res.ok) throw new Error("Failed to load conversations");
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUserId]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (conversations.length === 0)
    return <Alert variant="info">No conversations found.</Alert>;

  return (
    <ListGroup>
      {conversations.map((conv) => {
        const isBuyer = conv.buyerId === currentUserId;
        const otherUserName = isBuyer ? conv.sellerName : conv.buyerName;
        const otherUserAvatar = isBuyer ? conv.sellerAvatar : conv.buyerAvatar;
        const productImage = conv.adImage || "/placeholder.png";

        return (
          <ListGroup.Item
            action
            key={conv.conversationId}
            onClick={() => onSelectConversation(conv)}
            className="d-flex align-items-start gap-2"
          >
            <Image
              src={otherUserAvatar || "/avatar-placeholder.png"}
              alt={otherUserName}
              width={40}
              height={40}
              roundedCircle
            />
            <div style={{ flex: 1 }}>
              <strong>{conv.adName}</strong>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                With: {otherUserName}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#555" }}>
                {conv.lastMessageText || "No messages yet"}
              </div>
            </div>
            <small className="text-muted" style={{ whiteSpace: "nowrap" }}>
              {new Date(conv.updated_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </small>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};

export default ConversationsList;
