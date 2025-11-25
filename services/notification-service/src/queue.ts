import Queue from 'bull';
import Redis from 'ioredis';
import { sendEmail, sendSMS, sendPushNotification } from './services/notificationService';

let notificationQueue: Queue.Queue;

export async function initializeQueue() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    const redis = new Redis(redisUrl);
    
    notificationQueue = new Queue('notifications', {
      redis: redisUrl,
    });
    
    // Process notification jobs
    notificationQueue.process('email', async (job) => {
      await sendEmail(job.data);
    });
    
    notificationQueue.process('sms', async (job) => {
      await sendSMS(job.data.to, job.data.message);
    });
    
    notificationQueue.process('push', async (job) => {
      await sendPushNotification(job.data.userId, job.data.payload);
    });
    
    console.log('✅ Notification queue initialized');
  } catch (error) {
    console.error('Queue initialization error:', error);
    console.warn('⚠️  Running without queue - notifications will be sent synchronously');
  }
}

export function queueEmail(data: any) {
  if (notificationQueue) {
    return notificationQueue.add('email', data);
  }
  return sendEmail(data);
}

export function queueSMS(data: any) {
  if (notificationQueue) {
    return notificationQueue.add('sms', data);
  }
  return sendSMS(data.to, data.message);
}

export function queuePush(data: any) {
  if (notificationQueue) {
    return notificationQueue.add('push', data);
  }
  return sendPushNotification(data.userId, data.payload);
}
