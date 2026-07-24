const recurringModel = require('../models/recurringModel');
const categoryModel = require('../models/categoryModel');
const recurringService = require('../services/recurringService');


async function getAll(req, res) {
  try {
    const rules = await recurringModel.findAllByUser(req.userId);
    res.json({ rules });
  } catch (err) {
    console.error('Get recurring rules error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function create(req, res) {
  try {
    const { category_id, amount, type, description, frequency, start_date, end_date } = req.body;

    if (!amount || !type || !frequency || !start_date) {
      return res.status(400).json({ error: 'amount, type, frequency, and start_date are required' });
    }
    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(frequency)) {
      return res.status(400).json({ error: 'Invalid frequency' });
    }

    if (category_id) {
      const category = await categoryModel.findById(category_id, req.userId);
      if (!category) {
        return res.status(400).json({ error: 'Invalid category_id' });
      }
    }

    const rule = await recurringModel.create({
      user_id: req.userId,
      category_id: category_id || null,
      amount, type, description, frequency, start_date,
      end_date: end_date || null,
      last_generated: null,
    });
    res.status(201).json({ rule });
  } catch (err) {
    console.error('Create recurring rule error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    const existing = await recurringModel.findById(id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Recurring rule not found' });
    }
    await recurringModel.remove(id, req.userId);
    res.status(204).send();
  } catch (err) {
    console.error('Delete recurring rule error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function generate(req, res) {
  try {
    const result = await recurringService.generateForUser(req.userId);
    res.json(result);
  } catch (err) {
    console.error('Generate recurring error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { getAll, create, remove , generate };