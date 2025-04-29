import mongoose from 'mongoose'

const loginLogSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    success: { type: Boolean, required: true },
    timestamp: { type: Date, default: Date.now},
    ipAddress: { type: String },
})

const LoginLog = mongoose.model('LoginLog', loginLogSchema)
export default LoginLog