async function testAddProduct() {
  try {
    const response = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Coffee Beans (500g)',
        unit: 'packet',
        priceMinor: 25000, // 250 ETB
        quantity: 10,
        reorderLevel: 2
      })
    });
    const data = await response.json();
    console.log('Server Response after adding product:', data);
  } catch (err) {
    console.error('Error testing post:', err);
  }
}

testAddProduct();