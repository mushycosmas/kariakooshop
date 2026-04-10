import React, { useState } from 'react';
import { Button, Collapse, Form } from 'react-bootstrap';
import axios from 'axios';
import { useSession, signIn } from 'next-auth/react';

interface StartChatProps {
  adId: number | string;
  productName?: string;
}

const StartChat: React.FC<StartChatProps> = ({ adId, productName = 'this ad' }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { data: session, status } = useSession();

  const userId = session?.user?.id;

  const handleSend = async () => {
    if (!message.trim()) return;

    if (status === 'unauthenticated') {
      // Redirect to login page
      signIn(); // or signIn('google') for specific provider
      return;
    }

    if (!userId) {
      alert('User ID missing. Please re-login.');
      return;
    }

    setSending(true);

    try {
      const response = await axios.post('/api/chat/send-message', {
        adId,
        message,
        buyerId: userId,
      });

      if (response.data.success) {
        alert(`Message sent about "${productName}"`);
        setMessage('');
        setOpen(false);
      } else {
        alert('Failed to send message.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Server error while sending message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-3">
      {/* Toggle Chat Button */}
      <div
        onClick={() => {
          if (status === 'unauthenticated') {
            signIn(); // Redirect to login
          } else {
            setOpen(!open);
          }
        }}
        className="d-flex align-items-center justify-content-center border border-success rounded py-2 px-3"
        style={{
          cursor: 'pointer',
          color: '#00B53F',
          fontWeight: 600,
          backgroundColor: '#fff',
        }}
        role="button"
        aria-expanded={open}
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (status === 'unauthenticated') {
              signIn();
            } else {
              setOpen(!open);
            }
          }
        }}
      >
        <i className="bi bi-chat-dots-fill me-2" />
        Start Chat
      </div>

      {/* Chat Textarea */}
      <Collapse in={open}>
        <div className="mt-3">
          <Form>
            <Form.Group controlId="chatTextarea">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={`Type your message about ${productName}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
              />
            </Form.Group>
            <Button
              variant="success"
              className="mt-2 w-100"
              onClick={handleSend}
              disabled={sending}
              type="button"
            >
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </Form>
        </div>
      </Collapse>
    </div>
  );
};

export default StartChat;
