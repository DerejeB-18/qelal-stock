async function testTransaction() {
  try {
    // 1. Fetch products to get a valid ID automatically
    const prodResponse = await fetch('http://localhost:5000/api/products');
    const products = await prodResponse.json();

    if (products.length === 0) {
      console.log('No products found in inventory.');
      return;
    }

    const targetProduct = products[0]; // Let's pick the first product in the list
    console.log(`Testing sale on product: "${targetProduct.name}" (Current Stock: ${targetProduct.quantity})`);

    // 2. Record a sale transaction for 2 units
    const res = await fetch('http://localhost:5000/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: targetProduct._id,
        type: 'sale',
        quantity: 2,
        notes: 'Test sale for shopkeeper'
      })
    });

    const data = await res.json();
    console.log('Transaction Response:', data);
  } catch (err) {
    console.error('Error testing transaction:', err);
  }
}

testTransaction();