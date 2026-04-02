const mongoose = require('mongoose');
const { TRANSACTION_TYPES } = require('../utils/constants');

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
recordSchema.index({ category: 1 });
recordSchema.index({ date: -1 });
recordSchema.index({ createdBy: 1 });
recordSchema.index({ createdBy: 1, date: -1 });
recordSchema.index({ createdBy: 1, type: 1 });

// Exclude soft-deleted records by default
recordSchema.pre(/^find/, function () {
  this.where({ isDeleted: { $ne: true } });
});

module.exports = mongoose.model('Record', recordSchema);
