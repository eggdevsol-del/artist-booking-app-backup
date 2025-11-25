import { Router } from 'express';
import { sendPushNotification, sendEmail, sendSMS } from '../services/notificationService';

export const notificationRouter = Router();

// Send push notification
notificationRouter.post('/push', async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;
    await sendPushNotification(userId, { title, body, data });
    res.json({ success: true, message: 'Push notification sent' });
  } catch (error) {
    console.error('Push notification error:', error);
    res.status(500).json({ error: 'Failed to send push notification' });
  }
});

// Send email
notificationRouter.post('/email', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    await sendEmail({ to, subject, html, text });
    res.json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Send SMS
notificationRouter.post('/sms', async (req, res) => {
  try {
    const { to, message } = req.body;
    await sendSMS(to, message);
    res.json({ success: true, message: 'SMS sent' });
  } catch (error) {
    console.error('SMS error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// Send appointment confirmation
notificationRouter.post('/appointment-confirmation', async (req, res) => {
  try {
    const { userId, appointmentDetails } = req.body;
    
    // Send email
    await sendEmail({
      to: appointmentDetails.clientEmail,
      subject: 'Appointment Confirmed',
      html: `
        <h2>Your appointment has been confirmed!</h2>
        <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
        <p><strong>Date:</strong> ${new Date(appointmentDetails.startTime).toLocaleString()}</p>
        <p><strong>Artist:</strong> ${appointmentDetails.artistName}</p>
        <p>We look forward to seeing you!</p>
      `,
    });
    
    // Send push notification
    await sendPushNotification(userId, {
      title: 'Appointment Confirmed',
      body: `Your ${appointmentDetails.serviceName} appointment is confirmed for ${new Date(appointmentDetails.startTime).toLocaleDateString()}`,
      data: { appointmentId: appointmentDetails.id },
    });
    
    res.json({ success: true, message: 'Appointment confirmation sent' });
  } catch (error) {
    console.error('Appointment confirmation error:', error);
    res.status(500).json({ error: 'Failed to send appointment confirmation' });
  }
});
