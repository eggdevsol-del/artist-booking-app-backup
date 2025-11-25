import { Router } from 'express';
import { saveSubscription, deleteSubscription } from '../database';

export const subscriptionRouter = Router();

subscriptionRouter.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const subscription = req.body;
    const result = await saveSubscription(userId, subscription);
    res.json({ success: true, id: result?.insertedId });
  } catch (error) {
    console.error('Save subscription error:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

subscriptionRouter.delete('/', async (req, res) => {
  try {
    const { endpoint } = req.body;
    await deleteSubscription(endpoint);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});
