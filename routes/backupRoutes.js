import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Transaction from '../models/Transaction.js'
import Category from '../models/Category.js'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

router.get('/backup', async (req, res) => {
    try {
        const transactions = await Transaction.find().lean()
        const categories = await Category.find().lean()

        const backupData = {
            transactions,
            categories,
            createdAt: new Date().toISOString()
        }

        const backupJson = JSON.stringify(backupData, null, 2)

        // Tarayıcıya dosya indirme başlığı ayarlıyoruz
        res.setHeader('Content-Disposition', `attachment; filename=backup-${Date.now()}.json`)
        res.setHeader('Content-Type', 'application/json')

        res.send(backupJson)

    } catch (err) {
        console.error('yedekleme hatası:', err)
        res.status(500).json({ error: 'Yedekleme oluşturulamadı' })
    }
})

export default router
