import express from 'express'
import Transaction from '../models/Transaction'
import Invoice from '../models/Invoice'

const router = express.Router()

router.post('/generate', async (req, res) => {
    const { userId, month } = req.body

    const start = new Date(`${month}-01`)
    const end = new Date(start)
    end.setMonth(end.getMonth() +1)

    const transactions = await Transaction.find({
        user: userId,
        category: { $regex: /fatura/i},
        date: { $gte: start, $lt: end },
    })

    const total = transactions.reduce((sum, tx) => sum + tx.amount, 0)

    const invoice = new Invoice({
        user: userId,
        transactions: transactions.map(t => t._id),
        totalAmount: total
    })

    await invoice.save()

    res.json({ message: 'Fatura oluşturuldu', invoice})
})