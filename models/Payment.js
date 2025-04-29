import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    title: { type: String, required: true},
    amount: { type: Number, required: true},
    dueDate: { type: Date, required: true},
    isPaid: { type: Boolean, default: false},
    notes: { type: String }, //Notlar 
    createdAt: { type: Date, default: Date.now},
})

export default mongoose.model('Payment', paymentSchema)