const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const List = require('../models/List');
const authenticateToken = require('../middleware/authenticateToken');

// Create a new item
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, listId } = req.body;

    // Verify that the list belongs to the authenticated user
    const list = await List.findById(listId);
    if (!list || list.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to add items to this list' });
    }

    const newItem = new Item({ content, listId });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Error creating item' });
  }
});

// Edit an item
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Verify that the item belongs to a list owned by the authenticated user
    const list = await List.findById(item.listId);
    if (!list || list.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }

    item.content = content;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Error updating item' });
  }
});

// Delete an item
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Verify that the item belongs to a list owned by the authenticated user
    const list = await List.findById(item.listId);
    if (!list || list.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    await item.deleteOne();

    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting item' });
  }
});

// Get all items for a specific list
router.get('/list/:listId', authenticateToken, async (req, res) => {
  try {
    const { listId } = req.params;

    // Verify that the list belongs to the authenticated user
    const list = await List.findById(listId);
    if (!list || list.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view items for this list' });
    }

    const items = await Item.find({ listId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching items' });
  }
});

module.exports = router;
