import mongoose from 'mongoose'

const budgetSchema = new mongoose.Schema({
  month: { type: String, required: true }, // '2025-04' gibi
  limit: { type: Number, required: true }, // Harcama limiti (₺)
}, {
  timestamps: true
})

const Budget = mongoose.model('Budget', budgetSchema)

export default Budget