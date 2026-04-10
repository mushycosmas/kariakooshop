import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

const safetyTips = [
  'Do not transfer money before seeing the item in person',
  'Arrange to meet the seller in a secure, public location',
  'Examine the product carefully to confirm it matches your expectations',
  'Review all necessary documents and only complete payment when confident',
];

const SafetyTipsCard = () => {
  return (
    <>
      <style>{`
        .safety-card {
          background-color: #fffbe6;
          border: 1px solid #ffe58f;
        }

        .safety-card .card-title {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .safety-card .list-group-item {
          background-color: transparent;
          border: none;
          padding-left: 0;
          padding-right: 0;
        }

        .safety-card .tip-icon {
          color: #faad14;
          margin-right: 8px;
        }
      `}</style>

      <Card className="p-3 mb-4 safety-card shadow-sm rounded-3 mt-2">
        <Card.Title className="mb-3">
          🛡️ Safety Tips
        </Card.Title>
        <ListGroup variant="flush">
          {safetyTips.map((tip, index) => (
            <ListGroup.Item key={index} className="d-flex align-items-start">
              <span className="tip-icon">✔️</span>
              <span>{tip}</span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
    </>
  );
};

export default SafetyTipsCard;
