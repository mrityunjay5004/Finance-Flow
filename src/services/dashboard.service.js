const Record = require('../models/Record');

const getSummary = async (userId) => {
  const stats = await Record.aggregate([
    { $match: { createdBy: userId, isDeleted: false } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const summary = stats.reduce((acc, curr) => {
    if (curr._id === 'income') acc.income = curr.total;
    if (curr._id === 'expense') acc.expense = curr.total;
    acc.count += curr.count;
    return acc;
  }, { income: 0, expense: 0, count: 0 });

  return {
    totalIncome: summary.income,
    totalExpenses: summary.expense,
    balance: summary.income - summary.expense,
    transactionCount: summary.count
  };
};

const getCategoryBreakdown = (userId) => {
  return Record.aggregate([
    { $match: { createdBy: userId, isDeleted: false } },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { amount: -1 } },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        amount: 1,
        count: 1
      }
    }
  ]);
};

const getMonthlyTrends = (userId) => {
  return Record.aggregate([
    { $match: { createdBy: userId, isDeleted: false } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type'
        },
        total: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 24 },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        type: '$_id.type',
        total: 1
      }
    }
  ]);
};

const getRecentTransactions = (userId, limit = 5) => {
  return Record.find({ createdBy: userId, isDeleted: false })
    .sort({ date: -1 })
    .limit(limit)
    .populate('createdBy', 'name email');
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentTransactions
};
