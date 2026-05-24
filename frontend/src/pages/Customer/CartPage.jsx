import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Trash2, Edit3, ShieldAlert, ShoppingBag } from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const { API_BASE_URL } = useAuth();
  const { 
    cart, 
    tableNumber, 
    setTableNumber,
    specialInstructions, 
    setSpecialInstructions, 
    addToCart, 
    removeFromCart, 
    deleteItem, 
    clearCart,
    cartTotal,
    cartCount
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualTable, setManualTable] = useState(tableNumber || '');

  // Load Razorpay script
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const placeFinalOrder = async (paymentId) => {
    const finalTable = tableNumber || manualTable.trim();
    const orderPayload = {
      tableNumber: finalTable,
      specialInstructions,
      items: cart.map(item => ({
        menuItem: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      paymentStatus: 'Paid',
      paymentId: paymentId
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (data.success) {
        setTableNumber(finalTable);
        clearCart();
        navigate(`/order-status/${data.data._id}`);
      } else {
        setError(data.message || 'Something went wrong while placing your order.');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to reach server. Please check your internet connection.');
      setLoading(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    const finalTable = tableNumber || manualTable.trim();

    if (!finalTable) {
      setError('Please input your table number before submitting your order.');
      return;
    }
    if (cart.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Order in Razorpay backend
      const res = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cartTotal })
      });
      const resData = await res.json();

      if (!resData.success) {
        setError('Failed to initialize payment gateway.');
        setLoading(false);
        return;
      }

      const { data } = resData;

      // 2. If no real keys are provided, run the mock flow
      if (data.isMock) {
        setTimeout(() => {
          placeFinalOrder(`mock_payment_${Date.now()}`);
        }, 1500);
        return;
      }

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: "rzp_test_SVArwVtJgMVUjl", // Real Test Key
        amount: data.amount,
        currency: "INR",
        name: "Elaichi Restaurant",
        description: "Table " + finalTable,
        order_id: data.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              placeFinalOrder(response.razorpay_payment_id);
            } else {
              setError('Payment verification failed.');
              setLoading(false);
            }
          } catch (err) {
            setError("Error verifying payment.");
            setLoading(false);
          }
        },
        prefill: {
          name: "Table Guest",
          contact: "9999999999"
        },
        theme: {
          color: "#ea580c" // brand-500
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        setError("Payment failed: " + response.error.description);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      setError('Payment gateway error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-4.5 flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold font-sans tracking-tight text-slate-800">Review Your Cart</h1>
          <p className="text-xs text-slate-500 font-medium">Table Number: {tableNumber ? `#${tableNumber}` : 'Not Specified'}</p>
        </div>
      </header>

      {/* Cart Content */}
      <div className="px-4 mt-6">
        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} />
            </div>
            <h2 className="text-base font-bold text-slate-800 mb-1.5 font-sans">Your Cart is Empty</h2>
            <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">Scan a QR code or browse dishes from the main digital menu page.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Table Identification Block */}
            {!tableNumber && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                  Enter Your Table Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3, VIP-1"
                  value={manualTable}
                  onChange={(e) => {
                    setManualTable(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-bold text-slate-800"
                />
                <p className="text-[10px] text-amber-600 mt-1.5 font-medium">Please enter the number printed on your table standee to ensure proper delivery.</p>
              </div>
            )}

            {/* Error notifications */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2 text-xs">
                <ShieldAlert className="shrink-0 mt-0.5" size={16} />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Items Grid */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</h2>
              
              <div className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <div key={item._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate font-sans">{item.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">₹{item.price.toFixed(2)} each</p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Quantity switcher */}
                      <div className="flex items-center gap-2 bg-slate-100 border border-slate-200/50 px-1.5 py-1 rounded-xl">
                        <button 
                          onClick={() => removeFromCart(item._id)}
                          className="p-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg active:scale-90 transition-transform shadow-xs"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-slate-800 min-w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => addToCart(item)}
                          className="p-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg active:scale-90 transition-transform shadow-xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Delete */}
                      <button 
                        onClick={() => deleteItem(item._id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions Drawer */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <Edit3 size={14} />
                <span>Special Chef Instructions</span>
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Make it extra spicy, No onions, Serve ice on the side..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs text-slate-700 leading-relaxed"
              />
            </div>

            {/* Total Pricing Box */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3.5">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Breakdown</h2>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-600 font-bold">
                  <span>Contactless Ordering Charge</span>
                  <span>FREE</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-base font-black text-slate-800">
                  <span>Total Amount</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Final Place Order Button */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className={`w-full py-4.5 rounded-2xl text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center ${
                loading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/20 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Connecting to Gateway...</span>
                </span>
              ) : (
                <span>Confirm & Pay Securely</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
