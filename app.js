const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { adminJs, router: adminRouter } = require('./admin');

dotenv.config();

const app = express();
app.use(express.json());

app.use(adminJs.options.rootPath, adminRouter);


//MongoDB Bağlantısı 

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Bağlantısı Başarılı ✅'))
.catch((err) => console.error('MongoDB Bağlantı hatası:', err));

const transactionRoutes = require('./routes/transactionRoutes');
app.use('/api/transactions', transactionRoutes);

//Geçici ana rota 
app.get('/', (req, res) => {
    res.send('Finance Tracker API is running 🚀');
});

module.exports = app;