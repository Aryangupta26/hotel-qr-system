import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle2, ChevronRight, Play, Volume2, VolumeX, ShieldAlert, ChefHat, UtensilsCrossed } from 'lucide-react';

const KitchenDashboard = () => {
  const { socket, connected } = useSocket();
  const { API_BASE_URL } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [now, setNow] = useState(Date.now());
  
  // Persistent audio context
  const audioCtxRef = useRef(null);

  // Initialize or get the persistent audio context
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
    return audioCtxRef.current;
  };

  // Keep 'now' updated every 30 seconds to refresh order timer badges
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial active orders
  useEffect(() => {
    const fetchActiveOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/active`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
        } else {
          setError('Failed to fetch active kitchen queue.');
        }
      } catch (err) {
        setError('Network error fetching kitchen orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveOrders();
  }, []);

  // Synthesize digital chime using persistent AudioContext
  const playKitchenChime = (force = false, contextOverride = null) => {
    if (!soundEnabled && !force) return;
    try {
      const ctx = contextOverride || getAudioContext();
      if (!ctx) return;
      
      // If context is suspended (browser policy), attempt to resume
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      // We will create a rich, loud, bass-heavy alarm
      const osc1 = ctx.createOscillator(); // Deep Bass
      const osc2 = ctx.createOscillator(); // Mid tone
      const osc3 = ctx.createOscillator(); // High chime
      const gainNode = ctx.createGain();
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      osc3.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Deep bass wave for the "big base sound"
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(130.81, ctx.currentTime); // C3 (Bass)
      osc1.frequency.setValueAtTime(130.81, ctx.currentTime + 0.2); 
      
      // Mid-low thick tone
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
      osc2.frequency.setValueAtTime(329.63, ctx.currentTime + 0.2); // E4
      
      // Sharp attention-grabbing chime
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc3.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); // E5
      
      // VERY LOUD volume envelope (gain 1.5)
      gainNode.gain.setValueAtTime(1.5, ctx.currentTime);
      // Let it ring out a bit longer
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      
      osc1.start();
      osc2.start();
      osc3.start();
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
      osc3.stop(ctx.currentTime + 1.2);
    } catch (err) {
      console.warn('[Audio Warning] Synthesis block:', err.message);
    }
  };

  const handleToggleSound = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    
    if (newSoundState) {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      // Play a quick beep to confirm unlock
      playKitchenChime(true, ctx);
    }
  };

  // Realtime Socket integrations
  useEffect(() => {
    if (!socket) return;

    socket.emit('joinAdmin');

    const handleNewOrder = (newOrder) => {
      console.log('[Kitchen Socket] New order received!', newOrder.orderNumber);
      setOrders((prevOrders) => {
        if (prevOrders.find((o) => o._id === newOrder._id)) return prevOrders;
        // Append at the end (oldest at top)
        return [...prevOrders, newOrder];
      });
      playKitchenChime();
    };

    const handleOrderUpdated = (updatedOrder) => {
      setOrders((prevOrders) => {
        if (updatedOrder.orderStatus === 'Completed') {
          return prevOrders.filter((o) => o._id !== updatedOrder._id);
        }
        return prevOrders.map((o) => 
          o._id === updatedOrder._id ? updatedOrder : o
        );
      });
    };

    socket.on('newOrder', handleNewOrder);
    socket.on('orderUpdated', handleOrderUpdated);

    return () => {
      socket.off('newOrder', handleNewOrder);
      socket.off('orderUpdated', handleOrderUpdated);
    };
  }, [socket, soundEnabled]); // soundEnabled dependency ensures latest state is used in closures

  const updateStatus = async (id, nextStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      
      if (data.success) {
        setOrders((prevOrders) => {
          if (nextStatus === 'Completed') {
            return prevOrders.filter((o) => o._id !== id);
          }
          return prevOrders.map((o) => (o._id === id ? data.data : o));
        });
      }
    } catch (err) {
      console.error('[Kitchen Dashboard] Status shift failed:', err.message);
    }
  };

  const getMinutesElapsed = (createdAt) => {
    const elapsedMs = now - new Date(createdAt).getTime();
    return Math.floor(elapsedMs / 60000);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white font-sans overflow-x-hidden flex flex-col relative z-0">
      
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Kitchen Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#0a0f1c]/80 border-b border-white/[0.08] px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white p-3 rounded-2xl shadow-lg shadow-brand-500/20">
            <ChefHat size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white/95">
              <span>Chef's Kitchen Screen</span>
              <span className="text-[10px] bg-brand-500/10 text-brand-400 font-extrabold px-2.5 py-0.5 rounded-full border border-brand-500/20">LIVE OPS</span>
            </h1>
            <p className="text-xs text-white/50 font-bold tracking-wide mt-0.5">
              {orders.length} Active Orders in Queue
            </p>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="flex items-center gap-4">
          {/* Synthesizer Enable Switch */}
          <button
            onClick={handleToggleSound}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-lg ${
              soundEnabled
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-brand-500/20 ring-1 ring-brand-500/50'
                : 'bg-white/5 hover:bg-white/10 text-white/60 border border-white/10'
            }`}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? 'Order Alarm: ACTIVE' : 'Order Alarm: MUTED'}</span>
          </button>

          {/* Connection State Badge */}
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold border shadow-lg transition-colors ${
            connected 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5' 
              : 'bg-red-500/10 border-red-500/20 text-red-400 shadow-red-500/5'
          }`}>
            <span className="relative flex h-2.5 w-2.5">
              {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </span>
            {connected ? 'SOCKET: SECURE' : 'SOCKET: DISCONNECTED'}
          </div>
        </div>
      </header>

      {/* Main Board Grid */}
      <div className="flex-1 p-6 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-[4px] border-white/10 border-t-brand-500 mb-4 shadow-xl" />
            <p className="text-xs text-white/50 font-bold uppercase tracking-widest animate-pulse">Syncing Kitchen Display...</p>
          </div>
        ) : error ? (
          <div className="backdrop-blur-xl bg-red-500/5 border border-red-500/20 rounded-3xl p-8 text-center max-w-md mx-auto mt-20 flex flex-col items-center shadow-2xl">
            <div className="bg-red-500/10 p-4 rounded-full mb-4">
              <ShieldAlert className="text-red-400" size={32} />
            </div>
            <h3 className="font-bold text-red-400 text-lg mb-2">Kitchen Queue Error</h3>
            <p className="text-sm text-red-400/70 leading-relaxed">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-20 text-center max-w-2xl mx-auto mt-20 shadow-2xl transition-all">
            <div className="bg-white/[0.04] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/[0.05]">
              <UtensilsCrossed className="text-white/20" size={40} />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white/90 mb-3">Kitchen is Clear</h2>
            <p className="text-sm text-white/50 max-w-sm mx-auto leading-relaxed">
              When a table successfully places a paid order, it will appear here instantly with an alert chime.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start auto-rows-max">
            {orders.map((order) => {
              const minutes = getMinutesElapsed(order.createdAt);
              // Dynamic color indicator based on wait time
              const isUrgent = minutes >= 15 && order.orderStatus !== 'Ready';
              const isWarning = minutes >= 8 && minutes < 15 && order.orderStatus !== 'Ready';
              const isReady = order.orderStatus === 'Ready';

              return (
                <div 
                  key={order._id}
                  className={`relative rounded-3xl transition-all duration-500 overflow-hidden flex flex-col h-[520px] group animate-in fade-in zoom-in-95 ${
                    isReady
                      ? 'bg-emerald-950/10 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                      : isUrgent
                        ? 'bg-red-950/10 border border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20'
                        : isWarning
                          ? 'bg-amber-950/10 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]'
                          : 'backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] shadow-2xl hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Urgent Pulse Overlay */}
                  {isUrgent && (
                    <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
                  )}

                  {/* Card Header */}
                  <div className="p-5 flex items-center justify-between border-b border-white/[0.05] bg-white/[0.02]">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white tracking-tighter">
                        T-{order.tableNumber}
                      </span>
                      <span className="text-white/40 text-[10px] font-bold tracking-widest uppercase">
                        {order.orderNumber}
                      </span>
                    </div>

                    {/* Timer Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-lg backdrop-blur-md ${
                      isReady
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                        : isUrgent 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/20 animate-pulse' 
                          : isWarning 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/20' 
                            : 'bg-white/10 text-white/70 border border-white/10'
                    }`}>
                      <Clock size={14} />
                      <span>{minutes} MIN</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item._id} className="flex items-start gap-3.5 bg-white/[0.02] p-3 rounded-2xl border border-white/[0.03]">
                          <span className="w-8 h-8 bg-brand-500/20 border border-brand-500/30 text-brand-400 text-sm font-black rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/10">
                            {item.quantity}
                          </span>
                          <span className="text-[15px] font-bold text-white/90 mt-1 tracking-tight font-sans leading-snug">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Chef instruction notes */}
                    {order.specialInstructions && (
                      <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-amber-200/90 text-sm leading-relaxed shadow-lg">
                        <span className="font-black flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-amber-400 mb-2">
                          <ChefHat size={12} />
                          Special Request
                        </span>
                        "{order.specialInstructions}"
                      </div>
                    )}
                  </div>

                  {/* Controller Action buttons */}
                  <div className="p-4 bg-white/[0.02] border-t border-white/[0.05] mt-auto">
                    {order.orderStatus === 'New' && (
                      <button
                        onClick={() => updateStatus(order._id, 'Preparing')}
                        className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-brand-500/20 border border-brand-400/30"
                      >
                        <Play size={16} fill="currentColor" />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {order.orderStatus === 'Preparing' && (
                      <button
                        onClick={() => updateStatus(order._id, 'Ready')}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-emerald-500/20 border border-emerald-400/30"
                      >
                        <CheckCircle2 size={16} />
                        <span>Mark Hot & Ready</span>
                      </button>
                    )}

                    {order.orderStatus === 'Ready' && (
                      <button
                        onClick={() => updateStatus(order._id, 'Completed')}
                        className="w-full py-4 bg-white/10 hover:bg-white/15 text-white/90 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 border border-white/10 shadow-lg"
                      >
                        <span>Complete / Served</span>
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
};

export default KitchenDashboard;
