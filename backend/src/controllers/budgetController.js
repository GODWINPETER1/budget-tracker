const budgetModel = require('../models/budgetModel');
const transactionModel = require('../models/transactionModel');
const categoryModel = require('../models/categoryModel');

async function getAll(req, res) {
  try {
    const { month } = req.query;
    const budgets = await budgetModel.findAllByUser(req.userId, month);

    // attach "spent" to each budget
    const withSpent = await Promise.all(
      budgets.map(async (budget) => {
        const result = await transactionModel.sumByCategoryAndMonth(
          req.userId, budget.category_id, budget.month
        );
        return { ...budget, spent: Number(result.total) || 0 };
      })
    );

    res.json({ budgets: withSpent });
  } catch (err) {
    console.error('Get budgets error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function create(req, res) {
  try {
    const { category_id, amount_limit, month } = req.body;

    if (!category_id || !amount_limit || !month) {
      return res.status(400).json({ error: 'category_id, amount_limit, and month are required' });
    }

    const category = await categoryModel.findById(category_id, req.userId);
    if (!category) {
      return res.status(400).json({ error: 'Invalid category_id' });
    }

    const existing = await budgetModel.findByUserCategoryMonth(req.userId, category_id, month);
    if (existing) {
      return res.status(409).json({ error: 'Budget already exists for this category and month' });
    }

    const budget = await budgetModel.create({
      user_id: req.userId, category_id, amount_limit, month,
    });
    res.status(201).json({ budget });
  } catch (err) {
    console.error('Create budget error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const existing = await budgetModel.findById(id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const { amount_limit } = req.body;
    const budget = await budgetModel.update(id, req.userId, {
      amount_limit: amount_limit ?? existing.amount_limit,
    });
    res.json({ budget });
  } catch (err) {
    console.error('Update budget error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    const existing = await budgetModel.findById(id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await budgetModel.remove(id, req.userId);
    res.status(204).send();
  } catch (err) {
    console.error('Delete budget error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { getAll, create, update, remove };