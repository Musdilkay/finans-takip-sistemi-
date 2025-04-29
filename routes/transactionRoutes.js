import express from 'express';
import Transaction from '../models/Transaction.js';
import ExcelJS from 'exceljs';
import guessCategory from '../utils/categoryGuesser.js';

const router = express.Router();
//Tüm işlemleri getir 
router.get('/', async (req, res) => {
    const transactions = await  Transaction.find().sort({ date: -1 });
    res.json(transactions);
});

// Yeni işlem oluştur
router.post("/", async (req, res) => {
    try {
      let { title, amount, date, type, category } = req.body;
  
      if (!category || category.trim() === "") {
        category = guessCategory(title);
      }
  
      const transaction = new Transaction({
        title,
        amount,
        date,
        type,
        category,
      });
  
      await transaction.save();
      res.status(201).json(transaction);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  //İşlem güncelle
  router.put('/:id', async (req, res) => {
    try{
        const { title, amount, type } = req.body
        const updated = await Transaction.findByIdAndUpdate(
            req.params.id,
            { title, amount, type },
            { new: true } // güncel veriyi döndür 
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json( { error: err.message });
    }
  });

  //filtreli işlemleri getir 
  router.get('/filter', async (req, res) => {
    let filter = {};

    if (type) {
        filter.type = type; //income ya da expense
    }

    if (startDate || endDate) {
        filter.date = {};
        if (startDate) {
            filter.date.$gte = new Date(startDate);
        }
        if (endDate) {
            filter.date.$lte = new Date(endDate);
        }
    }

    try {
        const filteredTransactions = await Transaction.find(filter).sort({ date: -1});
        res.json(filteredTransactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  });

  //Toplam bakiye hesaplama 
  router.get('/summary/balance', async (req, res) => {
    try {
        const transactions = await Transaction.find();

        let income = 0;
        let expense = 0;

        transactions.forEach((tx) => {
            if (tx.type === 'income') {
                income += tx.amount;
            } else if (tx.type === 'expense') {
                expense += tx.amount;
            }
        });

        const balance = income - expense;

        res.json({
            income,
            expense,
            balance
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  });

  //Günlük Raporlar 
  router.get('/report/daily', async (req, res)  => {
    try{
        const transactions = await Transaction.aggregate([
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$date"}},
                        type: "$type"
                    },
                    totalAmount: { $sum: "$amount"}
                }
            },
            {
                $sort: { "_id.date": -1}
            }
        ]);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  });

  //Aylık Rapor
  router.get('/report/monthly', async (req, res) => {
    try {
        const transactions = await Transaction.aggregate([
            {
                $group: {
                    _id: {
                        month: { $dateToString: { format: "%Y-%m", date: "$date"} },
                        type: "$type"
                    },
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.month": -1 }
            }
        ]);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  });

  //Belirli Tarih Aralığına Göre Günlük Rapor
  router.get('/report/range', async (req, res) => {
    const { start, end } = req.query;

    if (!start || !end) {
        return res.status(400).json({ error: 'Lütfen start ve end parametrelerini belirtin (YYYY-MM-DD).'});
    }

    try {
        const transaction = await Transaction.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(start).getDate,
                        $lte: new Date(end)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$date"} },
                        type: "$type"
                    },
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.date": 1 }
            }
        ]);

        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  });
  //Belirli tarih aralığına göre AY bazlı rapor 
  router.get('/report/monthly', async ( req, res) => {
    const { start, end } = req.query;

    if(!start || !end) {
        return res.status(400).json({ error: 'Lütfen Start ve End Parametrelerini belirtin (YYYY-MM-DD).'});
    }

    try {
        const monthlyReport = await Transaction.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date (start),
                        $lte: new Date(end)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $dateToString: { format: "%Y-%m", date: "$date" } },
                        type: "$type"
                    },
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.month": 1 }
            }
        ]);
        res.json(monthlyReport);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  });

  //Kategoriye ve aya göre ay bazlı rapor
  router.get('/report/monthly-by-category', async (req, res) => {
    const { start, end } = req.query;

    if (!start || !end) {
        return res.status(400).json({ error: 'Lütfen start ve end parametrelerini belirtin (YYYY-MM-DD).'});
    }

    try {
        const report = await Transaction.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(start),
                        $lte: new Date(end)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $dateToString: { format: "%Y-%m", date: "$date"} },
                        category: "$category",
                        type: "$type"
                    },
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.month": 1 }
            }
        ]);

        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  });

  //Kategori bazlı toplam rapor (gelir/gider ayrımıyla)
  router.get('/report/total-by-category', async (req, res) => {
    const { start, end } = req.query;

    if (!start || !end) {
        return res.status(400).json({ error: 'Lütfen start ve end parametlerini belirtin (YYYY-MM-DD.' } );
    }


    try {
        const report = await Transaction.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(start),
                        $lte: new Date(end)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        category: "$category",
                        type: "$type"
                    },
                    totalAmount: { $sum: "$amount" }
                }
            }, 
            {
                $sort: { "_id.type":1, "totalAmount": -1 }
            }
        ]);
        res.json (report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  });

  // Kategori bazlı toplamları Excel olarak dışa aktarma

  router.get('/report/total-by-category/excel', async (req, res) => {
    const { start, end } = req.query;
  
    if (!start || !end) {
      return res.status(400).json({ error: 'Lütfen start ve end parametrelerini belirtin (YYYY-MM-DD).' });
    }
  
    try {
      const report = await Transaction.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(start),
              $lte: new Date(end)
            }
          }
        },
        {
          $group: {
            _id: {
              category: "$category",
              type: "$type"
            },
            totalAmount: { $sum: "$amount" }
          }
        },
        {
          $sort: { "_id.type": 1, "totalAmount": -1 }
        }
      ]);
  
      // Excel dosyası oluştur
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Kategori Raporu");
  
      // Başlık satırı
      worksheet.columns = [
        { header: "Tür", key: "type", width: 15 },
        { header: "Kategori", key: "category", width: 30 },
        { header: "Toplam Tutar", key: "totalAmount", width: 20 }
      ];
  
      // Verileri yaz
      report.forEach(item => {
        worksheet.addRow({
          type: item._id.type,
          category: item._id.category,
          totalAmount: item.totalAmount
        });
      });
  
      // Yanıtı Excel olarak gönder
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=Kategori-Raporu-${start}_to_${end}.xlsx`);
  
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  //Arama filtersi (title veya category içinde geçenleri getirir)
  router.get("/search", async (req, res) => {
    const { q } = req.query;
  
    if (!q) {
      return res.status(400).json({ error: "Arama terimi (q) eksik." });
    }
  
    try {
      const regex = new RegExp(q, "i"); // büyük/küçük harf duyarsız
  
      const results = await Transaction.find({
        $or: [
          { title: { $regex: regex } },
          { category: { $regex: regex } }
        ]
      }).sort({ date: -1 });
  
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // İşlem Sil 
  router.delete('/:id', async (req, res) => {
    try{
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ message: 'Transaction deleted'});
    } catch (err) {
        
        res.status(400).json({ error: err.message });
    }
  });
  

  export default router;