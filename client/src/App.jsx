import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, DollarSign, ShoppingCart, RefreshCw, PlusCircle, X, History, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'audit'
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state for Audit Log
  const [filterType, setFilterType] = useState('ALL');

  // Transaction Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [txType, setTxType] = useState('SALE');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductPriceETB, setNewProductPriceETB] = useState('');
  const [newProductQty, setNewProductQty] = useState('');
  const [newProductReorder, setNewProductReorder] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);

  // Fetch Dashboard Summary, Products & Transactions
  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, productsRes, txRes] = await Promise.all([
        fetch('http://localhost:5000/api/dashboard/summary'),
        fetch('http://localhost:5000/api/products'),
        fetch('http://localhost:5000/api/transactions')
      ]);
      
      const summaryData = await summaryRes.json();
      const productsData = await productsRes.json();
      const txData = await txRes.json();
      
      setSummary(summaryData);
      setProducts(productsData);
      setAllTransactions(txData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Could not connect to backend server. Make sure port 5000 is running!');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Transaction Submission
  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setSubmitting(true);
      setMessage('');

      const res = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct._id,
          type: txType,
          quantity: Number(quantity),
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record transaction');

      setMessage(`Success! Recorded ${txType} of ${quantity} for ${selectedProduct.name}`);
      setSelectedProduct(null);
      setQuantity(1);
      setNotes('');
      fetchData();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle New Product Submission
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setAddingProduct(true);
      setMessage('');

      const priceMinor = Math.round(parseFloat(newProductPriceETB) * 100);

      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName,
          unit: newProductCategory || 'General',
          priceMinor,
          quantity: Number(newProductQty),
          reorderLevel: newProductReorder ? Number(newProductReorder) : 5
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add product');

      setMessage(`Success! Added new product: ${newProductName}`);
      setIsAddModalOpen(false);
      setNewProductName('');
      setNewProductCategory('');
      setNewProductPriceETB('');
      setNewProductQty('');
      setNewProductReorder('');
      fetchData();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setAddingProduct(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white font-sans">
        <div className="text-center">
          <RefreshCw className="mx-auto animate-spin h-10 w-10 text-emerald-400 mb-2" />
          <p className="text-lg">Loading Qelal Stock Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-red-400 font-sans p-4">
        <div className="bg-slate-900 p-6 rounded-xl border border-red-500/30 max-w-md text-center">
          <AlertTriangle className="mx-auto h-12 w-12 mb-3 text-red-400" />
          <h2 className="text-xl font-bold mb-2 text-white">Connection Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (santim) => {
    return (santim / 100).toLocaleString() + ' ETB';
  };

  const filteredTransactions = allTransactions.filter(tx => {
    if (filterType === 'ALL') return true;
    return tx.type === filterType;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10 relative">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-800">
  <div className="flex items-center gap-3">
    <img src="/logo.png" alt="Qelal Stock Logo" className="h-12 w-12 rounded-xl object-cover border border-slate-800 shadow-sm" />
    <div>
      <h1 className="text-3xl font-extrabold text-white tracking-tight">Qelal Stock</h1>
      <p className="text-slate-400 text-sm mt-0.5">Smart Inventory Management & Audit System</p>
    </div>
  </div>
  <div className="flex gap-3 mt-4 md:mt-0">
    <button 
      onClick={() => setIsAddModalOpen(true)}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
    >
      <PlusCircle className="h-4 w-4" /> Add New Product
    </button>
    <button 
      onClick={fetchData}
      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition border border-slate-700"
    >
      <RefreshCw className="h-4 w-4" /> Refresh
    </button>
  </div>
</header>

      {/* Status Banner Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium border ${message.startsWith('Error') ? 'bg-red-950/50 border-red-800 text-red-200' : 'bg-emerald-950/50 border-emerald-800 text-emerald-200'}`}>
          {message}
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-sm font-medium">Total Products</span>
            <Package className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-white">{summary?.totalProducts || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-sm font-medium">Total Inventory Value</span>
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">{formatCurrency(summary?.totalValuationMinor || 0)}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-sm font-medium">Low Stock Alerts</span>
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white">{summary?.lowStockCount || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-sm font-medium">Recent Transactions</span>
            <TrendingUp className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{summary?.recentTransactions?.length || 0}</div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex gap-4 border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'inventory' 
              ? 'border-emerald-400 text-emerald-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="h-4 w-4" /> Inventory Catalog
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'audit' 
              ? 'border-emerald-400 text-emerald-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="h-4 w-4" /> Full Audit Log History
        </button>
      </div>

      {/* TAB 1: INVENTORY CATALOG */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-400" /> Inventory Items
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-lg">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 rounded-r-lg text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-800/50 transition">
                      <td className="py-4 px-4 font-semibold text-white">{product.name}</td>
                      <td className="py-4 px-4">
                        <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-700">
                          {product.unit || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-emerald-400 font-medium">{formatCurrency(product.priceMinor)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.quantity <= product.reorderLevel ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                          {product.quantity} units
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
  <button
    onClick={() => setSelectedProduct(product)}
    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
  >
    <ShoppingCart className="h-3.5 w-3.5" /> Sale / Restock
  </button>
  <button
    onClick={async () => {
      if (window.confirm(`Are you sure you want to archive ${product.name}?`)) {
        try {
          const res = await fetch(`http://localhost:5000/api/products/${product._id}/deactivate`, {
            method: 'PATCH'
          });
          if (!res.ok) throw new Error('Failed to archive product');
          setMessage(`Archived product: ${product.name}`);
          fetchData();
        } catch (err) {
          setMessage(`Error: ${err.message}`);
        }
      }
    }}
    className="bg-slate-800 hover:bg-red-950/50 text-slate-400 hover:text-red-400 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border border-slate-700 hover:border-red-800"
  >
    Archive
  </button>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-indigo-400" /> Record Transaction
              </h2>

              {selectedProduct ? (
                <form onSubmit={handleTransaction} className="space-y-4">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400">Selected Product</p>
                    <p className="text-sm font-bold text-white">{selectedProduct.name}</p>
                    <p className="text-xs text-emerald-400 mt-1">Current Stock: {selectedProduct.quantity} units</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Transaction Type</label>
                    <select 
                      value={txType} 
                      onChange={(e) => setTxType(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="SALE">SALE (Decrease Stock)</option>
                      <option value="RESTOCK">RESTOCK (Increase Stock)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Quantity</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={quantity} 
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Notes (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Cash sale..." 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-50"
                    >
                      {submitting ? 'Recording...' : 'Confirm'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setSelectedProduct(null)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium transition border border-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                  Click <span className="text-emerald-400 font-semibold">"Sale / Restock"</span> on any product in the inventory catalog.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOG HISTORY */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-400" /> Transaction Audit Log
            </h2>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Filter:
              </span>
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${filterType === 'ALL' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All ({allTransactions.length})
              </button>
              <button
                onClick={() => setFilterType('SALE')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${filterType === 'SALE' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Sales
              </button>
              <button
                onClick={() => setFilterType('RESTOCK')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${filterType === 'RESTOCK' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Restocks
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-xs tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Timestamp</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Stock Transition</th>
                  <th className="py-3 px-4 rounded-r-lg text-right">Total Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">
                      No matching audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-800/50 transition">
                      <td className="py-4 px-4 text-xs text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">
                        {tx.productName || tx.product?.name || 'Unknown Product'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${
                          tx.type === 'SALE' 
                            ? 'bg-red-950/60 text-red-400 border-red-800' 
                            : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        }`}>
                          {tx.type === 'SALE' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold">{tx.quantity}</td>
                      <td className="py-4 px-4 text-slate-400 text-xs">
                        {tx.stockBefore} ➔ <span className="text-white font-bold">{tx.stockAfter}</span>
                      </td>
                      <td className={`py-4 px-4 text-right font-bold ${tx.type === 'SALE' ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {formatCurrency(tx.totalMinor)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl relative">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-emerald-400" /> Add New Inventory Product
            </h2>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Teff (1kg)" 
                  value={newProductName} 
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category / Unit</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Grains" 
                    value={newProductCategory} 
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Price (in ETB)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="e.g. 150" 
                    value={newProductPriceETB} 
                    onChange={(e) => setNewProductPriceETB(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Initial Quantity</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="e.g. 25" 
                    value={newProductQty} 
                    onChange={(e) => setNewProductQty(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Reorder Alert Level</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="e.g. 5" 
                    value={newProductReorder} 
                    onChange={(e) => setNewProductReorder(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  disabled={addingProduct}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-50"
                >
                  {addingProduct ? 'Adding Product...' : 'Save Product'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium transition border border-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}