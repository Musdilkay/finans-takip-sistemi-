import express from 'express'
import mongoose from 'mongoose'
import { adminJs, adminRouter } from './admin.js'
import { setupRecurringJob } from './cron/recurringJob.js'

import transactionRoutes from './routes/transactionRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import backupRoutes from './routes/backupRoutes.js'
import budgetRoutes from './routes/budgetRoutes.js'
import userRoutes from './routes/userRoutes.js'

const app = express()
app.use(express.json())
app.use(express.static('public'))

// Önce AdminJS
app.use(adminJs.options.rootPath, adminRouter)

// Sonra API route'ları
app.use('/api/transactions', transactionRoutes)
app.use('/api/users', userRoutes)
app.use('/api/budget', budgetRoutes)
app.use('/api/backup', backupRoutes)
app.use('/reports', reportRoutes)

mongoose.connect('mongodb://localhost:27017/finance-app')
  .then(() => {
    app.listen(5000, () => {
      console.log('Server is running at 🚀 http://localhost:5000')
      console.log(`AdminJS Panel: http://localhost:5000${adminJs.options.rootPath}`)

      setupRecurringJob()
    })
  })
  .catch(console.error)
