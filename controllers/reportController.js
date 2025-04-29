import Transaction from "../models/Transaction";
import Category from "../models/Category";

export const checkBudgetLimit =async (req, res) => {
    try {
        const { categoryId, year, month} = req.query;

        const startDate = new Date(year, month -1, 1);
        const endDate = new Date (year, month, 0,23,59,59);

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Kategori Bulunamadı '});
        }

        const totalExpense = await Transaction.aggregate([
            {
                $match: {
                    category: category._id,
                    type: 'expense',
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                },
            },
        ]);
        const total = totalExpense[0]?.total || 0;

        if (category.budgetLimit == null) {
            return res.json({
                message: 'Bu kategori için bir bütçe lmiti tanımlanmaış',
                totalSpent: total,
            });
        }

        const exceeded = total > category.budgetLimit;
        res.json({
            category: category.name,
            budgetLimit: category.budgetLimit,
            totalSpent: total,
            eexceeded,
            message: exceeded
            ? 'Bütçe limiti aşıldı! 🛑'
            : 'Bütçe içinde kalındı. ✅',
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error});
    }
};