const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security shields and helpers
app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to our MongoDB Atlas Treasure Chest!
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas successfully! 💎'))
  .catch((err) => console.error('Database connection error:', err));

// Our special heartbeat route!
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all products from our database
app.get('/api/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = await Product.find({ isActive: true }).sort({ name: 1 });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add a new product to the inventory
app.post('/api/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const { name, unit, priceMinor, quantity, reorderLevel } = req.body;

    // Basic validation
    if (!name || priceMinor === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'Name, priceMinor, and quantity are required' });
    }

    const newProduct = new Product({
      name,
      unit: unit || 'piece',
      priceMinor,
      quantity,
      reorderLevel: reorderLevel || 0
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Soft delete / deactivate a product
app.patch('/api/products/:id/deactivate', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deactivated successfully', product });
  } catch (err) {
    console.error('Error deactivating product:', err);
    res.status(500).json({ error: 'Failed to deactivate product' });
  }
});

// Record a transaction (Sale or Restock) and update product quantity
app.post('/api/transactions', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const Transaction = require('./models/Transaction');
    const { productId, type, quantity, notes } = req.body;

    if (!productId || !type || !quantity) {
      return res.status(400).json({ error: 'productId, type, and quantity are required' });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const stockBefore = product.quantity;
    let updatedQuantity = stockBefore;

    // Ensure type matches schema enum (e.g., 'SALE' or 'RESTOCK')
    const txType = type.toUpperCase() === 'SALE' ? 'SALE' : 'RESTOCK';

    if (txType === 'SALE') {
      if (stockBefore < quantity) {
        return res.status(400).json({ error: 'Not enough stock available for this sale' });
      }
      updatedQuantity -= quantity;
    } else {
      updatedQuantity += quantity;
    }

    // Update product quantity in database
    product.quantity = updatedQuantity;
    await product.save();

    // Calculate total price in santim
    const totalMinor = product.priceMinor * quantity;

    // Create and save the detailed transaction record
    const newTransaction = new Transaction({
      product: productId,
      productName: product.name,
      type: txType,
      quantity,
      unitPriceMinor: product.priceMinor,
      totalMinor,
      stockBefore,
      stockAfter: updatedQuantity,
      notes: notes || ''
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json({
      message: 'Transaction recorded successfully!',
      transaction: savedTransaction,
      currentStock: product.quantity
    });
  } catch (err) {
    console.error('Error recording transaction:', err);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

// Get all transaction logs (sorted by newest first)
app.get('/api/transactions', async (req, res) => {
  try {
    const Transaction = require('./models/Transaction');
    const transactions = await Transaction.find()
      .populate('product', 'name priceMinor unit')
      .sort({ createdAt: -1 })
      .limit(50); // limit to last 50 transactions for speed
      
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transaction logs' });
  }
});

// Get dashboard summary (valuation, low stock alerts, counts)
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const Transaction = require('./models/Transaction');

    const products = await Product.find({ isActive: true });

    let totalValuationMinor = 0;
    let lowStockItems = [];

    products.forEach(p => {
      totalValuationMinor += p.priceMinor * p.quantity;
      if (p.quantity <= p.reorderLevel) {
        lowStockItems.push(p);
      }
    });

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalProducts: products.length,
      totalValuationMinor,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      recentTransactions
    });
  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// Turn on the server
app.listen(PORT, () => {
  console.log(`Server is awake and running on port ${PORT}!`);
});