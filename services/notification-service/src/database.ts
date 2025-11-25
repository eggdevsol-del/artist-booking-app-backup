import { MongoClient, Db } from 'mongodb';

let db: Db;

export async function initializeDatabase() {
  const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
  const client = new MongoClient(mongoUrl);
  
  try {
    await client.connect();
    db = client.db('notifications');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't fail if MongoDB is not available - graceful degradation
    console.warn('⚠️  Running without MongoDB - notifications will not be persisted');
  }
}

export async function getSubscriptionsForUser(userId: string) {
  if (!db) return [];
  
  try {
    const subscriptions = await db
      .collection('push_subscriptions')
      .find({ userId })
      .toArray();
    
    return subscriptions.map(sub => ({
      endpoint: sub.endpoint,
      keys: sub.keys,
    }));
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
}

export async function saveSubscription(userId: string, subscription: any) {
  if (!db) return null;
  
  try {
    const result = await db.collection('push_subscriptions').insertOne({
      userId,
      endpoint: subscription.endpoint,
      keys: JSON.stringify(subscription.keys),
      createdAt: new Date(),
    });
    
    return result;
  } catch (error) {
    console.error('Error saving subscription:', error);
    throw error;
  }
}

export async function deleteSubscription(endpoint: string) {
  if (!db) return null;
  
  try {
    const result = await db.collection('push_subscriptions').deleteOne({ endpoint });
    return result;
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
}

export async function saveTemplate(userId: string, template: any) {
  if (!db) return null;
  
  try {
    const result = await db.collection('notification_templates').insertOne({
      userId,
      ...template,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return result;
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
}

export async function getTemplatesForUser(userId: string) {
  if (!db) return [];
  
  try {
    const templates = await db
      .collection('notification_templates')
      .find({ userId })
      .toArray();
    
    return templates;
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
}
