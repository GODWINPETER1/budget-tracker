const categoryModel = require('../models/categoryModel');

async function getAll(req, res) {
  try {
    const categories = await categoryModel.findAllByUser(req.userId);
    res.json({ categories });
  } catch (err) {
    console.error('Get categories error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function create(req, res) {
  try {
    const { name, type } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'name and type are required' });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'type must be income or expense' });
    }

    const category = await categoryModel.create({ user_id: req.userId, name, type });
    res.status(201).json({ category });
  } catch (err) {
    console.error('Create category error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    const existing = await categoryModel.findById(id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = await categoryModel.update(id, req.userId, {
      name: name ?? existing.name,
      type: type ?? existing.type,
    });
    res.json({ category });
  } catch (err) {
    console.error('Update category error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    const existing = await categoryModel.findById(id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await categoryModel.remove(id, req.userId);
    res.status(204).send();
  } catch (err) {
    console.error('Delete category error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { getAll, create, update, remove };