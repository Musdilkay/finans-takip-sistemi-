import mongoose from 'mongoose'

const recurringTransactionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true},
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    dayOfMonth: { type: Number, min: 1, max: 31, required: true }, 
    isActive: { type: Boolean, default: true},
})

export default mongoose.model('RecurringTransaction', recurringTransactionSchema)