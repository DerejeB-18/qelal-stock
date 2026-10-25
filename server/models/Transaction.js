const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  type: { type: String, enum: ['SALE', 'RESTOCK'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPriceMinor: { type: Number, required: true, min: 0 },
  totalMinor: { type: Number, required: true, min: 0 },
  stockBefore: { type: Number, required: true, min: 0 },
  stockAfter: { type: Number, required: true, min: 0 }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Transaction', transactionSchema);