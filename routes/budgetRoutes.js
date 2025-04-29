import express from 'express'
import Budget from '../models/Budget.js'
import Transaction from '../models/Transaction.js'

const router = express.Router()

//Aylık Bütçe Oluştur

router.post('/', async (req, res) => {
    try {
        const { month, limit } = req.body

        const existingBudget = await Budget.findOne({ month })
        if (existingBudget) {
            return res.status(400).json({ error: 'Bu aya ait bütçe zaten belirlenmiş'})
        }

        const budget = new Budget({ month, limit})
        await budget.save()

        res.status(201).json(budget)
    } catch (err) {
        console.error('Bütçe oluşturma hatası:', err)
        res.status(500).json({ error: 'Sunucu hatası'})
    }
})

//Aylık Bütçeyi getir 
router.get('/:month', async (req, res) => {
    try {
        const { month } = req.params

        const budget = await Budget.findOne( { month })
        if(!budget) {
            return res.status(404).json({ error: 'Bu Ay İçin Bütçe Bulunamadı :('})
        }

        res.json(budget)
    } catch (err) {
        console.error('Bütçe getirme hatası:', err)
        res.status(500).json({ error: 'Sunucu hatası'})
    }
})
// Aylık bütçe aşımını kontrol et
router.get('/check/:month', async (req, res) => {
    try {
      const { month } = req.params
  
      // Ayın başlangıcı ve bitişini al
      const startDate = new Date(`${month}-01`)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
  
      // Bu ayın toplam giderini hesapla
      const transactions = await Transaction.aggregate([
        {
          $match: {
            type: 'expense',
            date: {
              $gte: startDate,
              $lt: endDate,
            }
          }
        },
        {
          $group: {
            _id: null,
            totalExpenses: { $sum: '$amount' }
          }
        }
      ])
  
      const totalExpenses = transactions[0]?.totalExpenses || 0
  
      // Bu ay için belirlenmiş bütçeyi bul
      const budget = await Budget.findOne({ month })
  
      if (!budget) {
        return res.status(404).json({ error: 'Bu ay için belirlenen bir bütçe yok.' })
      }
  
      // Bütçeyi aşmış mıyız?
      const overBudget = totalExpenses > budget.limit
  
      res.json({
        month,
        budgetLimit: budget.limit,
        totalExpenses,
        overBudget,
        message: overBudget 
          ? '⚠️ Bütçeyi aştınız!' 
          : '✅ Harcamalar bütçe limitinin içinde.'
      })
  
    } catch (err) {
      console.error('Bütçe aşımı kontrol hatası:', err)
      res.status(500).json({ error: 'Sunucu hatası' })
    }
  })
  

export default router