import nodemailer from 'nodemailer';
import webpush from 'web-push';
import twilio from 'twilio';
import { getSubscriptionsForUser } from '../database';

// Email configuration
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Web Push configuration
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:' + (process.env.VAPID_EMAIL || 'admin@example.com'),
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Twilio configuration
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function sendEmail(options: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  try {
    const info = await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || '"Artist Booking" <noreply@artistbooking.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

export async function sendSMS(to: string, message: string) {
  if (!twilioClient) {
    console.warn('Twilio not configured, skipping SMS');
    return;
  }
  
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    
    console.log('SMS sent:', result.sid);
    return result;
  } catch (error) {
    console.error('SMS send error:', error);
    throw error;
  }
}

export async function sendPushNotification(
  userId: string,
  payload: { title: string; body: string; data?: any }
) {
  try {
    const subscriptions = await getSubscriptionsForUser(userId);
    
    if (subscriptions.length === 0) {
      console.log('No push subscriptions for user:', userId);
      return;
    }
    
    const pushPayload = JSON.stringify(payload);
    
    const results = await Promise.allSettled(
      subscriptions.map(subscription =>
        webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: JSON.parse(subscription.keys),
          },
          pushPayload
        )
      )
    );
    
    console.log(`Push notifications sent to ${results.filter(r => r.status === 'fulfilled').length}/${subscriptions.length} subscriptions`);
    return results;
  } catch (error) {
    console.error('Push notification error:', error);
    throw error;
  }
}
