import AdminJS from 'adminjs'
import { ComponentLoader } from 'adminjs'
import * as AdminJSExpress from '@adminjs/express'
import * as AdminJSMongoose from '@adminjs/mongoose'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import Invoice from './models/Invoice.js'
import Payment from './models/Payment.js'


import Transaction from './models/Transaction.js'
import Category from './models/Category.js'
import Budget from './models/Budget.js'
import User from './models/User.js'
import LoginLog from './models/LoginLog.js'
import RecurringTransaction from './models/RecurringTransaction.js'

// __dirname çözümü
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// AdminJS ayarları
AdminJS.registerAdapter(AdminJSMongoose)

const componentLoader = new ComponentLoader()
const DashboardComponent = componentLoader.add('Dashboard', path.join(__dirname, './components/Dashboard/index.jsx'))

const adminJs = new AdminJS({
  databases: [mongoose],
  rootPath: '/admin',
  componentLoader,
  // CSS OVERRIDE EKLENDİ (CRITICAL FIX)
  assets: {
    styles: [
      // Input'lar için global CSS fix
      'https://cdn.jsdelivr.net/gh/your-repo/adminjs-fix.css@latest/style.css' // VEYA yerel dosya yolu
    ]
  },
  resources: [
    {
      resource: Category,
      options: {
        listProperties: ['name', 'type'],
        editProperties: ['name', 'type'],
        properties: {
          type: {
            availableValues: [
              { value: 'income', label: 'Gelir' },
              { value: 'expense', label: 'Gider' },
            ],
          },
        },
      },
    },
    {
      resource: Payment,
      options: {
        listProperties: ['title', 'amount', 'dueDate', 'isPaid'],
        editProperties: ['title', 'amount', 'dueDate', 'isPaid', 'notes'],
        filterProperties: ['isPaid', 'dueDate'],
        properties: {
          isPaid: {
            availableValues: [
              { value: true, label: 'Ödendi' },
              { value: false, label: 'Bekliyor' }
            ]
          }
        }
      }
    },
    {
      resource: Invoice,
      options: {
        listProperties: ['user', 'totalAmount', 'status', 'date'],
        editProperties: ['user', 'transactions', 'totalAmount', 'status'],
        properties: {
          user: {
            isVisible: { list: true, filter: true, show: true, edit: true }
          },
          transactions: {
            isVisible: { list: false, filter: false, show: true, edit: true }
          }
        },
        actions: {
          generateInvoice: {
            actionType: 'record',
            label: 'Fatura Oluştur',
            icon: 'DocumentCheck',
            handler: async (request, response, context) => {
              const { record } = context
              const userId = record.param('_id')
              const now = new Date()
              const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
              const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
              const faturaTransactions = await Transaction.find({
                user: userId,
                category: { $regex: /fatura/i },
                date: { $gte: startOfMonth, $lte: endOfMonth }
              })
    
              const total = faturaTransactions.reduce((sum, t) => sum + t.amount, 0)
    
              const newInvoice = new Invoice({
                user: userId,
                transactions: faturaTransactions.map(t => t._id),
                totalAmount: total,
                status: 'created'
              })
    
              await newInvoice.save()
    
              return {
                notice: {
                  message: `Fatura başarıyla oluşturuldu. Tutar: ${total.toFixed(2)}₺`,
                  type: 'success'
                }
              }
            }
          }
        }
      }
    },
    {
      resource: RecurringTransaction,
      options: {
        listProperties: ['title', 'amount', 'type', 'category', 'dayOfMonth', 'isActive'],
        editProperties: ['title', 'amount', 'type', 'category', 'dayOfMonth', 'isActive'],
        properties: {
          type: {
            availableValues: [
              { value: 'income', label: 'Gelir' },
              { value: 'expense', label: 'Gider' },
            ],
          },
        },
      }
    } ,
    
    {
      resource: Transaction,
      options: {
        properties: {
          category: {
            isVisible: { list: true, edit: true, filter: true, show: true },
          },
        },
        actions: {
          new: {
            before: async (request) => {
              if (request.payload?.category && typeof request.payload.category === 'string') {
                const category = await Category.findOne({ name: request.payload.category })
                if (category) {
                  request.payload.category = category._id
                }
              }
              return request
            },
            
          },
          bulkDelete: {
            actionType: 'bulk',
            icon: 'Trash',
            guard: 'Seçili kayıtları silmek istediğinize emin misiniz?',
            handler: async (request, response, context) => {
              const { records } = context

              if (!records || records.length === 0) {
                return {
                  notice: {
                    message: 'Hiç kayıt seçilmedi!',
                    type: 'error',
                  },
                }
              }

              await Promise.all(
                records.map(async (record) => {
                  if (record?.params?._id) {
                    await Transaction.deleteOne({ _id: record.params._id })
                  }
                })
              )

              return {
                notice: {
                  message: 'Seçili kayıtlar başarıyla silindi!',
                  type: 'success',
                },
              }
            },
          },
        },
      },
    },
  ],
  dashboard: {
    handler: async (req, res, context) => {
      const [totalIncomeResult, totalExpenseResult, transactionCount, currentBudget] = await Promise.all([
        Transaction.aggregate([
          { $match: { type: 'income' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Transaction.aggregate([
          { $match: { type: 'expense' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Transaction.countDocuments(),
        Budget.findOne({ month: new Date().toISOString().slice(0, 7) }),
      ])

      const totalIncome = totalIncomeResult[0]?.total || 0
      const totalExpense = totalExpenseResult[0]?.total || 0
      const netBalance = totalIncome - totalExpense

      let budgetLimit = currentBudget?.limit || 0
      let overBudget = totalExpense > budgetLimit

      return {
        totalIncome,
        totalExpense,
        netBalance,
        transactionCount,
        budgetLimit,
        overBudget,
      }
    },
    component: DashboardComponent,
  },
  branding: {
    companyName: 'F-TAK',
    logo: '/f-tak-logo.png.png',
    softwareBrothers: false,
    theme: {
      colors: {
        // 1. METİN RENKLERİ (SİYAH-BEYAZ KONTRAST)
        text: '#000000', // Ana metin SİYAH
        textSecondary: '#333333',
        grey100: '#ffffff', // Ana arkaplan BEYAZ
        grey80: '#f8f9fa',
        filterBg: '#ffffff',
        
        // 2. INPUT STİLLERİ
        inputBg: '#ffffff',
        inputBorder: '#ced4da',
        inputText: '#000000', // Input metin rengi SİYAH
        
        // 3. PRIMARY RENKLER
        primary100: '#1a365d',
        primary80: '#2a4365',
        primary60: '#2c5282',
        primary40: '#3182ce',
        primary20: '#4299e1',
      },
      fonts: {
        primary: 'system-ui, -apple-system, sans-serif',
        size: '15px'
      },
      shadows: {
        login: '0 4px 6px rgba(0, 0, 0, 0.1)',
        cardHover: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }
    }
  }
})

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  adminJs,
  {
    authenticate: async (email, password) => {
      const user = await User.findOne({ email })
      if (user) {
        const matched = await user.comparePassword(password)
        if (matched) {
          // Başarılı giriş log kaydı
          await LoginLog.create({
            userEmail: email,
            success: true,
            ipAddress: '', // IP yakalama gerekiyorsa middleware ile eklenebilir
          })
          return user
        }
      }

      // Başarısız giriş log kaydı
      await LoginLog.create({
        userEmail: email,
        success: false,
        ipAddress: ip,
      })
      return false
    },
    cookiePassword: 'çok_gizli_bir_cookie_sifresi',
  },
  null,
  {
    resave: false,
    saveUninitialized: true,
    secret: 'çok_gizli_bir_cookie_sifresi',
  }
)


export { adminJs, adminRouter }