import express from 'express';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';

const router = express.Router();

// Aylık gelir/gider özeti
router.get('/monthly-summary', async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: { year: '$_id.year', month: '$_id.month' },
          totals: {
            $push: {
              type: '$_id.type',
              total: '$total'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          income: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$totals',
                    as: 't',
                    cond: { $eq: ['$$t.type', 'income'] }
                  }
                },
                as: 'i',
                in: '$$i.total'
              }
            }
          },
          expense: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$totals',
                    as: 't',
                    cond: { $eq: ['$$t.type', 'expense'] }
                  }
                },
                as: 'e',
                in: '$$e.total'
              }
            }
          }
        }
      },
      {
        $addFields: {
          balance: { $subtract: ['$income', '$expense'] }
        }
      },
      {
        $sort: { year: -1, month: -1 }
      }
    ]);

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kategori Bazlı Harcama Raporu
router.get('/expense-by-category', async (req, res) => {
  try {
    const results = await Transaction.aggregate([
      { $match: { type: 'expense' } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $unwind: '$categoryInfo',
      },
      {
        $project: {
          _id: 0,
          category: '$categoryInfo.name',
          totalAmount: 1,
        },
      },
    ]);

    res.json(results);
  } catch (error) {
    console.error('Kategori bazlı rapor hatası:', error);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});

export default router;
