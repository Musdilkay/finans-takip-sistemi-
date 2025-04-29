import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import User from './models/User.js'

await mongoose.connect('mongodb://127.0.0.1:27017/finance-tracker-api')

const email = 'admin@example.com'
const plainPassword = '123456'

const hashedPassword = await bcrypt.hash(plainPassword, 10)

await User.create({ email, password: hashedPassword })

console.log('Kullanıcı başarıyla oluşturuldu!')

process.exit()