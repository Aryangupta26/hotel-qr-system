import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { 
  TrendingUp, ShoppingBag, Coffee, ListCollapse, 
  Layers, LogOut, CheckCircle, Utensils, Clock, Award, ShieldCheck, Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, token, API_BASE_URL } = useAuth();
  const { socket } = useSocket();

  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
    activeOrders: 0,
    topItems: []
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authenticate Admin Session
  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    }
  }, [token]);

  // Fetch Dashboard Stats & All Orders
  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [statsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/orders/stats/summary`, { headers }),
        fetch(`${API_BASE_URL}/api/orders`, { headers })
      ]);

      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();

      if (statsData.success && ordersData.success) {
        setStats(statsData.data);
        setOrders(ordersData.data);
      }
    } catch (err) {
      console.error('[Admin Dashboard] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Socket Listener for realtime metrics updating
  useEffect(() => {
    if (!socket || !token) return;

    socket.emit('joinAdmin');

    const handleNewOrder = () => {
      // Re-fetch all statistics and list state to sync numbers
      fetchData();
    };

    const handleOrderUpdated = () => {
      fetchData();
    };

    socket.on('newOrder', handleNewOrder);
    socket.on('orderUpdated', handleOrderUpdated);

    return () => {
      socket.off('newOrder', handleNewOrder);
      socket.off('orderUpdated', handleOrderUpdated);
    };
  }, [socket, token]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchData(); // Refresh list and numbers
      }
    } catch (err) {
      console.error('[Dashboard Update] Status set error:', err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* Sidebar Logo */}
        <div className="px-6 py-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
          <span className="text-2xl">⚙️</span>
          <div>
            <h2 className="text-sm font-black text-white leading-none">Elaichi Admin</h2>
            <p className="text-[10px] text-slate-500 font-bold tracking-wider mt-1.5 uppercase">Management Hub</p>
          </div>
        </div>

        {/* Links Grid */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            to="/admin/dashboard" 
            className="flex items-center gap-3 px-4 py-3 bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/10"
          >
            <Layers size={16} />
            <span>Orders Overview</span>
          </Link>
          <Link 
            to="/admin/menu" 
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-bold transition-colors text-slate-400"
          >
            <Coffee size={16} />
            <span>Manage Food Menu</span>
          </Link>
          <Link 
            to="/admin/tables" 
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-bold transition-colors text-slate-400"
          >
            <ListCollapse size={16} />
            <span>Tables & QR Setup</span>
          </Link>
          <Link 
            to="/kitchen" 
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-bold transition-colors text-slate-400"
          >
            <Activity size={16} />
            <span>Open Kitchen screen</span>
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition-colors"
          >
            <LogOut size={16} />
            <span>Exit Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Top Navbar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Active Orders Center</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Review live checkouts, daily metrics, and table allocations.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="p-1 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck size={20} />
            </span>
            <span className="text-xs font-extrabold text-slate-700">Authenticated: Administrator</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Metric counters widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Daily revenue */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Sales</p>
                  <p className="text-lg font-black text-slate-800 mt-0.5">₹{stats.todayRevenue.toFixed(2)}</p>
                </div>
              </div>

              {/* Total revenue */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Sales</p>
                  <p className="text-lg font-black text-slate-800 mt-0.5">₹{stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>

              {/* Active orders */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cooking Queue</p>
                  <p className="text-lg font-black text-slate-800 mt-0.5">{stats.activeOrders} active</p>
                </div>
              </div>

              {/* Total orders */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Tickets</p>
                  <p className="text-lg font-black text-slate-800 mt-0.5">{stats.totalOrders} checkouts</p>
                </div>
              </div>
            </div>

            {/* Grid Split: Live Orders Feed & Top sold items */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Active orders list */}
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight font-sans">Live Active Orders Feed</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-2">Ticket</th>
                        <th className="pb-3">Table</th>
                        <th className="pb-3">Items</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {orders.filter(o => o.orderStatus !== 'Completed').length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                            No active pending orders.
                          </td>
                        </tr>
                      ) : (
                        orders.filter(o => o.orderStatus !== 'Completed').map((order) => (
                          <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4.5 pl-2 font-extrabold text-slate-800 font-mono">{order.orderNumber}</td>
                            <td className="py-4.5 font-bold">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/50 font-bold">
                                T-{order.tableNumber}
                              </span>
                            </td>
                            <td className="py-4.5 pr-4">
                              <div className="max-w-[200px] truncate font-medium text-slate-600" title={order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}>
                                {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                              </div>
                              {order.specialInstructions && (
                                <span className="inline-block mt-1 text-[9px] text-amber-600 bg-amber-50 px-1 py-0.2 rounded font-bold border border-amber-100 max-w-[180px] truncate">
                                  Note: "{order.specialInstructions}"
                                </span>
                              )}
                            </td>
                            <td className="py-4.5 font-black text-slate-800">₹{order.totalAmount.toFixed(2)}</td>
                            <td className="py-4.5">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.8 rounded-full text-[9px] font-extrabold ${
                                order.orderStatus === 'New' 
                                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                  : order.orderStatus === 'Preparing'
                                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${
                                  order.orderStatus === 'New' ? 'bg-blue-500' : order.orderStatus === 'Preparing' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                                }`}></span>
                                {order.orderStatus.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4.5 text-right pr-2">
                              {order.orderStatus === 'New' && (
                                <button
                                  onClick={() => updateOrderStatus(order._id, 'Preparing')}
                                  className="px-2.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold text-[10px] transition-transform active:scale-95"
                                >
                                  Cook
                                </button>
                              )}
                              {order.orderStatus === 'Preparing' && (
                                <button
                                  onClick={() => updateOrderStatus(order._id, 'Ready')}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition-transform active:scale-95"
                                >
                                  Ready
                                </button>
                              )}
                              {order.orderStatus === 'Ready' && (
                                <button
                                  onClick={() => updateOrderStatus(order._id, 'Completed')}
                                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg font-bold text-[10px] transition-transform active:scale-95 border border-slate-700"
                                >
                                  Serve
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sidebar stats breakdown: Top items */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight font-sans">Top Selling Dishes</h3>
                
                <div className="space-y-4">
                  {stats.topItems.length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium py-4 text-center">No sales metrics recorded yet.</p>
                  ) : (
                    stats.topItems.map((item, index) => (
                      <div key={item._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold ${
                            index === 0 
                              ? 'bg-amber-100 text-amber-700' 
                              : index === 1 
                                ? 'bg-slate-100 text-slate-600' 
                                : 'bg-orange-50 text-orange-600'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{item._id}</span>
                        </div>
                        <span className="text-xs font-extrabold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{item.count} sold</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Info Box */}
                <div className="bg-brand-50/50 border border-brand-100 rounded-2xl p-4.5 space-y-2">
                  <h4 className="text-[10px] font-black text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={14} />
                    <span>Restaurant Pro Tip</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    Mount the **Kitchen Screen** on a separate wall tablet or laptop. Order status changes sync in real-time across customers' phones!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
