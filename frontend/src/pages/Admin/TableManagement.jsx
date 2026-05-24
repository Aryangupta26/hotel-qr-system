import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Coffee, Layers, ListCollapse, LogOut, Activity, Plus, Download, Printer, Trash2, X, ShieldAlert 
} from 'lucide-react';

const TableManagement = () => {
  const navigate = useNavigate();
  const { logout, token, API_BASE_URL } = useAuth();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Table creation form state
  const [tableNumber, setTableNumber] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Session guard
  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    }
  }, [token]);

  const fetchTables = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tables`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTables(data.data);
      }
    } catch (err) {
      console.error('[Table Setup] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTables();
    }
  }, [token]);

  // Submit new table
  const handleCreateTable = async (e) => {
    e.preventDefault();
    setError('');

    if (!tableNumber.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tableNumber: tableNumber.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setTableNumber('');
        fetchTables(); // Refresh card grid
      } else {
        setError(data.message || 'Failed to create table. Duplicate values may exist.');
      }
    } catch (err) {
      setError('Connection to backend lost.');
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle table active status
  const toggleTableStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`${API_BASE_URL}/api/tables/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchTables();
      }
    } catch (err) {
      console.error('[Table Toggle] Error:', err.message);
    }
  };

  // Delete Table
  const handleDeleteTable = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table and void its QR code?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/tables/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchTables();
      }
    } catch (err) {
      console.error('[Table CRUD] Deletion failed:', err.message);
    }
  };

  // Trigger quick browser print layout for a specific QR card
  const handlePrintQR = (tableNum, qrDataUrl) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Table ${tableNum}</title>
          <style>
            body {
              font-family: 'Outfit', sans-serif;
              text-align: center;
              padding: 40px;
              color: #0f172a;
            }
            .card {
              border: 3px solid #0f172a;
              border-radius: 24px;
              padding: 30px;
              display: inline-block;
              max-width: 420px;
              box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            }
            h1 {
              font-size: 32px;
              margin-bottom: 5px;
              font-weight: 800;
            }
            p {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 25px;
            }
            img {
              width: 300px;
              height: 300px;
            }
            .footer {
              margin-top: 25px;
              font-size: 12px;
              font-weight: bold;
              letter-spacing: 1px;
              color: #ea580c;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>TABLE ${tableNum}</h1>
            <p>Scan to Browse Elaichi Menu & Place Order Instantly</p>
            <img src="${qrDataUrl}" alt="QR Code" />
            <div class="footer">🍽️ Elaichi Restaurant Contactless Dining 🍽️</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar Panel */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        <div className="px-6 py-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
          <span className="text-2xl">⚙️</span>
          <div>
            <h2 className="text-sm font-black text-white leading-none">Elaichi Admin</h2>
            <p className="text-[10px] text-slate-500 font-bold tracking-wider mt-1.5 uppercase">Management Hub</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            to="/admin/dashboard" 
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-bold transition-colors text-slate-400"
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
            className="flex items-center gap-3 px-4 py-3 bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/10"
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

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition-colors"
          >
            <LogOut size={16} />
            <span>Exit Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Tables & QR Allocator</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Provision physical tables and download downloadable QR dining cards.</p>
          </div>
        </div>

        {/* Add Table Input Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-8 max-w-xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5">Provision New Table QR</h3>
          
          <form onSubmit={handleCreateTable} className="flex gap-4 items-start">
            <div className="flex-1">
              <input
                type="text"
                required
                placeholder="e.g. 4, VIP-1, Patio-C"
                value={tableNumber}
                onChange={(e) => { setTableNumber(e.target.value); setError(''); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs font-bold text-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={isCreating || !tableNumber.trim()}
              className={`px-5 py-3 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 shadow-md ${
                isCreating || !tableNumber.trim()
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/10'
              }`}
            >
              <Plus size={16} />
              <span>{isCreating ? 'Wiring QR...' : 'Add Table'}</span>
            </button>
          </form>

          {/* Validation warnings */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl flex items-start gap-2 text-xs mt-3.5">
              <ShieldAlert className="shrink-0 mt-0.5" size={16} />
              <span className="font-semibold">{error}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[35vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight font-sans">
              Currently Provisioned Tables ({tables.length} tables)
            </h2>

            {tables.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                <span className="text-3xl mb-3 block">🪑</span>
                <p className="text-slate-400 font-medium text-xs leading-relaxed max-w-xs mx-auto">
                  No tables found in configuration database. Setup table "1" or "VIP-1" above to generate your first printable QR card.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {tables.map((table) => (
                  <div 
                    key={table._id}
                    className={`bg-white rounded-2xl border p-4.5 flex flex-col justify-between items-center text-center shadow-xs transition-all ${
                      table.status === 'active'
                        ? 'border-slate-100'
                        : 'border-red-100 opacity-60 bg-red-50/10'
                    }`}
                  >
                    {/* Header Label and Delete */}
                    <div className="w-full flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.6 rounded-lg text-[9px] font-extrabold border ${
                        table.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-red-50 text-red-500 border-red-100'
                      }`}>
                        {table.status.toUpperCase()}
                      </span>
                      <button
                        onClick={() => handleDeleteTable(table._id)}
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Delete Table"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Table Title */}
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight font-sans">
                      Table #{table.tableNumber}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Contactless QR Menu Standee</p>

                    {/* QR Image Viewport */}
                    <div className="w-40 h-40 bg-white border border-slate-100 rounded-2xl p-2 my-4 flex items-center justify-center shadow-xs">
                      {table.qrCodeDataUrl ? (
                        <img 
                          src={table.qrCodeDataUrl} 
                          alt={`QR Table ${table.tableNumber}`} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold">QR Broken</span>
                      )}
                    </div>

                    {/* Controller Action buttons */}
                    <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
                      <a
                        href={table.qrCodeDataUrl}
                        download={`table-${table.tableNumber}-qr.png`}
                        className="py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl text-slate-600 font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors"
                        title="Download PNG File"
                      >
                        <Download size={12} />
                        <span>PNG</span>
                      </a>
                      <button
                        onClick={() => handlePrintQR(table.tableNumber, table.qrCodeDataUrl)}
                        className="py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors"
                        title="Trigger Browser Printer layout"
                      >
                        <Printer size={12} />
                        <span>Print</span>
                      </button>
                    </div>

                    {/* Quick status toggler */}
                    <button
                      onClick={() => toggleTableStatus(table._id, table.status)}
                      className={`w-full py-2 rounded-xl border text-[9px] font-extrabold tracking-wide uppercase transition-colors mt-2.5 ${
                        table.status === 'active'
                          ? 'border-red-500/20 text-red-500 bg-red-50/20 hover:bg-red-50'
                          : 'border-emerald-500/20 text-emerald-600 bg-emerald-50/20 hover:bg-emerald-50'
                      }`}
                    >
                      {table.status === 'active' ? 'Deactivate Table' : 'Activate Table'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TableManagement;
