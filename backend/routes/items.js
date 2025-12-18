const express = require('express');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/items
 * Query params:
 *  - search (optional)
 *  - category (optional: job | course | book)
 *  - page (optional, default 1)
 *  - limit (optional, default 10)
 */
router.get('/', async (req, res) => {
  try {
    const { search = '', category, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    const numericLimit = parseInt(limit, 10) || 10;
    const numericPage = parseInt(page, 10) || 1;

    const [items, total] = await Promise.all([
      Item.find(query)
        .sort({ createdAt: -1 })
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit),
      Item.countDocuments(query)
    ]);

    res.json({
      items,
      total,
      page: numericPage,
      pages: Math.ceil(total / numericLimit)
    });
  } catch (err) {
    console.error('ITEMS LIST ERROR:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/items/:id - get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error('ITEM GET BY ID ERROR:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


/**
 * POST /api/items
 * Protected: requires auth (for now, any logged-in user; later you can restrict to admin)
 * Body: { title, category, description, location, salary, link, image }
 */
router.post('/', auth, async (req, res) => {
  try {
    const { title, category, description, location, salary, link, image } = req.body;

    const item = new Item({
      title,
      category,
      description,
      location,
      salary,
      link,
      image
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error('ITEM CREATE ERROR:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
