import mongoose from "mongoose";


const categorySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    budgetLimit: {
      type: Number,
      default: null, // Tanımsız olabilir
    },
  }, {
    timestamps: true,
  })
const Category = mongoose.model('Category', categorySchema)

export default Category