const transactionModel = require('../models/transactionModel');
const categoryModel = require('../models/categoryModel');

async function getAll(req, res) {
  try {
    const { type, categoryId, startDate, endDate, page, limit } = req.query;
    const result = await transactionModel.findAllByUser(req.userId, {
      type, categoryId, startDate, endDate, page, limit,
    });
    res.json(result);
  } catch (err) {
    console.error('Get transactions error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function create(req, res) {
  try {
    const { category_id, amount, type, description, date } = req.body;

    if (!amount || !type || !date) {
      return res.status(400).json({ error: 'amount, type, and date are required' });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'type must be income or expense' });
    }

    if (category_id) {
      const category = await categoryModel.findById(category_id, req.userId);
      if (!category) {
        return res.status(400).json({ error: 'Invalid category_id' });
      }
    }

    const transaction = await transactionModel.create({
      user_id: req.userId,
      category_id: category_id || null,
      amount,
      type,
      description,
      date,
    });
    res.status(201).json({ transaction });
  } catch (err) {
    console.error('Create transaction error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const existing = await transactionModel.findById(id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const { category_id, amount, type, description, date } = req.body;

    if (category_id) {
      const category = await categoryModel.findById(category_id, req.userId);
      if (!category) {
        return res.status(400).json({ error: 'Invalid category_id' });
      }
    }

    const transaction = await transactionModel.update(id, req.userId, {
      category_id: category_id ?? existing.category_id,
      amount: amount ?? existing.amount,
      type: type ?? existing.type,
      description: description ?? existing.description,
      date: date ?? existing.date,
    });
    res.json({ transaction });
  } catch (err) {
    console.error('Update transaction error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    const existing = await transactionModel.findById(id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await transactionModel.remove(id, req.userId);
    res.status(204).send();
  } catch (err) {
    console.error('Delete transaction error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { getAll, create, update, remove };