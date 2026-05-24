import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, Clock, CheckCircle2, ChevronRight, Utensils, Smile } from 'lucide-react';

const OrderStatusPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const { API_BASE_URL } = useAuth();
  const { setTableNumber } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const statusStages = ['New', 'Preparing', 'Ready', 'Completed'];

  // Fetch initial order state
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
        const data = await res.json();
        
        if (data.success) {
          setOrder(data.data);
          // Set table number in context if not locked
          setTableNumber(data.data.tableNumber);
        } else {
          setError('Order not found or invalid ticket.');
        }
      } catch (err) {
        setError('Failed to load order. Check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Handle Socket.IO realtime synchronizations
  useEffect(() => {
    if (!socket || !order) return;

    // Join room for this table
    socket.emit('joinTable', { tableNumber: order.tableNumber });
    console.log(`[Status Page] Joined table room: table_${order.tableNumber}`);

    // Listen for status changes
    const handleStatusUpdate = (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        console.log(`[Socket Status Change] Order ${updatedOrder.orderNumber} is now: ${updatedOrder.orderStatus}`);
        setOrder(updatedOrder);
      }
    };

    socket.on('statusUpdate', handleStatusUpdate);

    return () => {
      socket.off('statusUpdate', handleStatusUpdate);
    };
  }, [socket, order, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent mb-3" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing order state...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
          <Utensils size={32} />
        </div>
        <h2 className="text-base font-bold text-slate-800 mb-1">Retrieval Failed</h2>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-6">{error || 'Could not locate order details.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const currentStatusIndex = statusStages.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white px-4 py-4.5 shadow-xs border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-black text-slate-800">Order Tracker</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ticket {order.orderNumber}</p>
          </div>
        </div>

        {/* Realtime status tag */}
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
          connected ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
          {connected ? 'LIVE CONNECTION' : 'RECONNECTING'}
        </span>
      </header>

      <div className="px-4 mt-6 space-y-6">
        {/* Main Status Hero Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-center">
          <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-border border">
            {order.orderStatus === 'New' && <Clock size={28} />}
            {order.orderStatus === 'Preparing' && <Utensils size={28} />}
            {order.orderStatus === 'Ready' && <CheckCircle2 size={28} />}
            {order.orderStatus === 'Completed' && <Smile size={28} />}
          </div>
          
          <h2 className="text-xl font-black text-slate-800 tracking-tight font-sans">
            {order.orderStatus === 'New' && 'Order Received'}
            {order.orderStatus === 'Preparing' && 'Chef is Preparing'}
            {order.orderStatus === 'Ready' && 'Dish is Hot & Ready!'}
            {order.orderStatus === 'Completed' && 'Hope You Enjoyed!'}
          </h2>
          
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            {order.orderStatus === 'New' && 'Your order was sent to the kitchen. Stand by for status updates!'}
            {order.orderStatus === 'Preparing' && 'Ingredients are being chopped and cooked fresh just for you.'}
            {order.orderStatus === 'Ready' && 'A server is bringing your hot dish to your table right now!'}
            {order.orderStatus === 'Completed' && 'Thank you for dining with us! Let us know if you want anything else.'}
          </p>

          <span className="inline-block mt-4 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
            Table #{order.tableNumber}
          </span>
        </div>

        {/* Dynamic Status Progress Timeline */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Preparation Stages</h3>
          
          <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {statusStages.map((stage, index) => {
              const isActive = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <div key={stage} className="flex items-start gap-4.5 relative z-10">
                  {/* Timeline indicator circle */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    isCurrent 
                      ? 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/20' 
                      : isActive 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {index < currentStatusIndex ? (
                      <span className="font-extrabold text-[10px]">✓</span>
                    ) : (
                      <span className="font-black text-xs">{index + 1}</span>
                    )}
                  </div>

                  <div className="pt-1">
                    <h4 className={`text-xs font-bold font-sans ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                      {stage === 'New' && 'Order Transmitted'}
                      {stage === 'Preparing' && 'Cooking in Progress'}
                      {stage === 'Ready' && 'Ready for Serving'}
                      {stage === 'Completed' && 'Delivered & Served'}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {stage === 'New' && 'Checked and queued'}
                      {stage === 'Preparing' && 'Wok tossed and cooked'}
                      {stage === 'Ready' && 'Fresh on the counter'}
                      {stage === 'Completed' && 'Enjoy your meal!'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ticket Summary Accordion */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Summary</h3>
          
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item._id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs text-slate-600 font-medium">
                <div>
                  <span className="font-extrabold text-slate-800">{item.quantity}x</span> {item.name}
                </div>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {order.specialInstructions && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-slate-600 text-[11px] leading-relaxed">
              <span className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[9px]">Your Note to Chef:</span>
              "{order.specialInstructions}"
            </div>
          )}

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-sm font-black text-slate-800">
            <span>Total Paid</span>
            <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Persistent Order More button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 shadow-lg flex items-center justify-center">
        <button
          onClick={() => navigate('/')}
          className="w-full py-4.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>Order More Dishes</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default OrderStatusPage;
