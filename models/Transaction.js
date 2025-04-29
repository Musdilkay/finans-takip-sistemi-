// models/Transaction.js
import mongoose from 'mongoose'
import Category from './Category.js';

const transactionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    required: true
  }
})

const Transaction = mongoose.model('Transaction', transactionSchema)

export default Transaction
