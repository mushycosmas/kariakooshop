"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Form, Row, Col, Card, Image, Spinner } from "react-bootstrap";
import { io } from "socket.io-client";

let socket: any;

interface Message {
  conversationId: number;
  senderId: number;
  from: "buyer" | "seller";
  text: string;
  sentAt: string;
}

interface Product {
  id: number;
  name: string;
  brand: string;
  price: string;
  image: string;
}

interface MessageChatProps {
  conversationId: number;
  currentUserId: number;
  product?: Product;
}

const MessageChat: React.FC<MessageChatProps> = ({
  conversationId,
  currentUserId = 2,
  product,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!conversationId) return;

    if (!socket) {
      socket = io(); // Connects to server at same origin
    }

    socket.emit("joinRoom", conversationId);

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
        const data = await res.json();
        setMessages(data || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const newMessageHandler = (msg: Message) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("newMessage", newMessageHandler);

    return () => {
      socket.off("newMessage", newMessageHandler);
      socket.emit("leaveRoom", conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newMessage.trim()) return;

  setSending(true);

  const msgData: Message = {
    conversationId,
    senderId: currentUserId,
    from: currentUserId === 2 ? 'buyer' : 'seller', // Replace with actual role logic
    text: newMessage.trim(),
    sentAt: new Date().toISOString(),
  };

  try {
    // 1. Send to database first
    const res = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgData),
    });

    if (!res.ok) throw new Error('Failed to send message');

    // 2. Emit via socket (for real-time)
    socket.emit("sendMessage", msgData);

    // 3. Optimistic UI update
    setMessages((prev) => [...prev, msgData]);
    setNewMessage("");
  } catch (err) {
    console.error(err);
    alert("Failed to send message. Try again.");
  } finally {
    setSending(false);
  }
};



  return (
  <Card className="p-3 shadow-sm  h-100 d-flex flex-column" style={{ minHeight: "500px" }}>
  {/* Product Info */}
  {product && (
    <Row className="mb-3 align-items-center">
      <Col xs={4} md={2}>
        <Image src={product.image} fluid rounded alt={product.name} />
      </Col>
      <Col>
        <h5 className="mb-1">{product.name}</h5>
        <small className="text-muted">{product.brand}</small>
        <div className="fw-bold text-primary mt-1">{product.price}</div>
      </Col>
    </Row>
  )}

  {/* Chat Messages */}
  <div
    className="flex-grow-1"
    style={{
      overflowY: "auto",
      background: "#f0f2f5",
      padding: 10,
      borderRadius: "0.75rem",
      marginBottom: 15,
      border: "1px solid #ccc",
    }}
  >
    {loading ? (
      <div className="text-center py-3">
        <Spinner animation="border" size="sm" />
      </div>
    ) : messages.length === 0 ? (
      <div className="text-muted text-center">No messages yet</div>
    ) : (
      messages.map((msg, idx) => {
        const isBuyer = msg.from === "buyer";
        return (
          <div
            key={idx}
            className={`d-flex ${isBuyer ? "justify-content-end" : "justify-content-start"} mb-2`}
          >
            <div
              className={`p-2 rounded-3 shadow-sm ${
                isBuyer ? "bg-primary text-white" : "bg-light text-dark"
              }`}
              style={{
                maxWidth: "75%",
                borderBottomRightRadius: isBuyer ? 0 : "0.5rem",
                borderBottomLeftRadius: !isBuyer ? 0 : "0.5rem",
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.text}
              <div
                className={`small mt-1 text-end ${
                  isBuyer ? "text-white-50" : "text-muted"
                }`}
                style={{ fontSize: "0.7rem" }}
              >
                {new Date(msg.sentAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        );
      })
    )}
    <div ref={messagesEndRef} />
  </div>

  {/* Message Input */}
  <Form onSubmit={handleSendMessage}>
    <Row className="g-2">
      <Col xs={9}>
        <Form.Control
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
          autoComplete="off"
        />
      </Col>
      <Col xs={3}>
        <Button variant="primary" type="submit" className="w-100" disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </Button>
      </Col>
    </Row>
  </Form>
</Card>

  );
};

export default MessageChat;
