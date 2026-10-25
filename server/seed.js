const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const sampleProducts = [
  { name: 'Sugar (1kg)', unit: 'kg', priceMinor: 8500, quantity: 20, reorderLevel: 5 },
  { name: 'Cooking Oil (1L)', unit: 'bottle', priceMinor: 12000, quantity: 15, reorderLevel: 3 },
  { name: 'Tebele Tea', unit: 'packet', priceMinor: 3500, quantity: 30, reorderLevel: 10 },
  { name: 'Notebook', unit: 'piece', priceMinor: 2500, quantity: 50, reorderLevel: 10 }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database for seeding...');

    // Clear existing products and insert fresh ones
    await Product.deleteMany({});
    console.log('Old items cleared.');

    await Product.insertMany(sampleProducts);
    console.log('Sample shop items planted successfully into MongoDB Atlas! 🌱💎');

    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
    mongoose.connection.close();
  }
}

seedDatabase();