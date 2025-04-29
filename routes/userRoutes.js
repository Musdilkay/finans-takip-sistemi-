import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User.js'

const router = express.Router()

// Şifre güncelleme
router.put('/update-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' })
    }

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ error: 'Eski şifre yanlış' })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedNewPassword
    await user.save()

    res.json({ message: 'Şifre başarıyla güncellendi' })
  } catch (error) {
    console.error('Şifre güncelleme hatası:', error)
    res.status(500).json({ error: 'Sunucu hatası' })
  }
})

export default router
