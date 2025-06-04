const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  content: { type: String, required: true },
  listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
});

module.exports = mongoose.model('Item', itemSchema);
