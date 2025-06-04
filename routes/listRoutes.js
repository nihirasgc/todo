const express = require('express');
const router = express.Router();
const List = require('../models/List');
const authenticateToken = require('../middleware/authenticateToken');

// Create a new list
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const newList = new List({ name, description, userId: req.user.id }); // Associate list with the user
    await newList.save();
    res.status(201).json(newList);
  } catch (error) {
    res.status(500).json({ error: 'Error creating list' });
  }
});

// Edit a list
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    const list = await List.findById(req.params.id);
    if (list.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this list' });
    }

    const updatedList = await List.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    res.json(updatedList);
  } catch (error) {
    res.status(500).json({ error: 'Error updating list' });
  }
});

// Delete a list
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (list.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this list' });
    }

    await List.findByIdAndDelete(req.params.id);
    res.json({ message: 'List deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting list' });
  }
});

// Get all lists
router.get('/', authenticateToken, async (req, res) => {
  try {
    const lists = await List.find({ userId: req.user.id }); // Fetch only authenticated user's lists
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching lists' });
  }
});

module.exports = router;
