import { NextApiRequest, NextApiResponse } from 'next';
import { Alert } from '../../types/types';

// In production, this would be stored in a database
let mockAlerts: Alert[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Return all alerts
    return res.status(200).json({ alerts: mockAlerts });
  }

  if (req.method === 'POST') {
    // Create a new alert
    const { investmentId, type, message, severity, changePercentage } = req.body;
    const newAlert: Alert = {
      id: Math.random().toString(36).substring(7),
      investmentId,
      type,
      message,
      severity,
      timestamp: new Date(),
      isRead: false,
      changePercentage
    };
    mockAlerts.push(newAlert);
    return res.status(201).json({ alert: newAlert });
  }

  if (req.method === 'PUT') {
    // Mark alert as read
    const { id } = req.body;
    const alert = mockAlerts.find(a => a.id === id);
    if (alert) {
      alert.isRead = true;
      return res.status(200).json({ alert });
    }
    return res.status(404).json({ message: 'Alert not found' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 