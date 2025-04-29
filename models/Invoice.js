import mongoose from 'mongoose'

const invoiceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: { type: Date, default: Date.now },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction'}],
    totalAmount : Number,
    status: { type: String, enum: ['created', 'sent'], default: 'created'}
})

export default mongoose.model('Invoice', invoiceSchema)