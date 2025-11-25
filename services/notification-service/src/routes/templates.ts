import { Router } from 'express';
import { saveTemplate, getTemplatesForUser } from '../database';

export const templateRouter = Router();

templateRouter.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const templates = await getTemplatesForUser(userId);
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

templateRouter.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const template = req.body;
    const result = await saveTemplate(userId, template);
    res.json({ success: true, id: result?.insertedId });
  } catch (error) {
    console.error('Save template error:', error);
    res.status(500).json({ error: 'Failed to save template' });
  }
});
