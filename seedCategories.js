import mongoose from 'mongoose'
import Category from './models/Category.js'
import dotenv from 'dotenv'
dotenv.config()

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI)

  const defaultCategories = ['Gelir', 'Gider']

  for (const name of defaultCategories) {
    const exists = await Category.findOne({ name })
    if (!exists) {
      await Category.create({ name })
      console.log(`Kategori eklendi: ${name}`)
    }
  }

  mongoose.disconnect()
}

seed()
