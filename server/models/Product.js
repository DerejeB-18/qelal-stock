const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameLower: { type: String, required: true },
  unit: { type: String, default: 'piece', required: true },
  priceMinor: { type: Number, required: true, min: 0 }, // Price in santim (1 ETB = 100 santim)
  quantity: { type: Number, required: true, min: 0, default: 0 },
  reorderLevel: { type: Number, required: true, min: 0, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Automatically make a lowercase name for easy searching
productSchema.pre('validate', function() {
  if (this.name) {
    this.nameLower = this.name.trim().toLowerCase();
  }
});

module.exports = mongoose.model('Product', productSchema);