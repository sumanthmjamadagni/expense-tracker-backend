const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Get all transactions for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new transaction for authenticated user
router.post('/', auth, async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      userId: req.user._id
    });
    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete transaction for authenticated user
router.delete('/:id', auth, async (req, res) => {
  try {
    await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get balance summary for authenticated user
router.get('/balance', auth, async (req, res) => {
  try {
    const income = await Transaction.aggregate([
      { $match: { type: 'income', userId: req.user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const expenses = await Transaction.aggregate([
      { $match: { type: 'expense', userId: req.user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalIncome = income[0]?.total || 0;
    const totalExpenses = expenses[0]?.total || 0;
    const balance = totalIncome - totalExpenses;

    res.json({
      totalIncome,
      totalExpenses,
      balance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;