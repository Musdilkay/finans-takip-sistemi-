import cron from 'node-cron'
import RecurringTransaction from '../models/RecurringTransaction.js'
import Transaction from '../models/Transaction.js'

export const setupRecurringJob = () => {
    // Her gün saat 6'da çalışır
    cron.schedule('0 6 * * *', async () => {
        const today = new Date()
        const currentDay = today.getDate()

        const recurringItems = await RecurringTransaction.find({
            isActive: true,
            dayOfMonth: currentDay,
        })

        for ( const item of recurringItems) {
            const transaction = new Transaction({
                title: item.title,
                amount: item.amount,
                type: item.type,
                category: item.category,
                date: today,
            })

            await transaction.save()
            console.log(`Yinelenen işlem eklendi: ${item.title}`)
        }
    })
}