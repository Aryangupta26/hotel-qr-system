import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Search, ShoppingBag, Plus, Minus, Check, AlertCircle } from 'lucide-react';

const MenuPage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { API_BASE_URL } = useAuth();
  const { cart, tableNumber, setTableNumber, addToCart, removeFromCart, cartCount, cartTotal } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['All', 'Starters', 'Main Course', 'Drinks', 'Desserts']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [tableError, setTableError] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Table registration and validation
  useEffect(() => {
    if (tableId) {
      const validateTable = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/tables/validate/${tableId}`);
          const data = await res.json();
          if (data.success) {
            setTableNumber(data.tableNumber);
            setTableError('');
            console.log(`[Menu] Checked and locked Table #${data.tableNumber}`);
          } else {
            setTableError('This table QR code appears to be inactive. Please ask staff for assistance.');
          }
        } catch (err) {
          console.error('[Menu Table Error] Validation failed:', err.message);
          // Graceful fallback for local development without DB connection
          setTableNumber(tableId);
        }
      };
      validateTable();
    }
  }, [tableId]);

  // Fetch Menu Items
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/menu`);
        const data = await res.json();
        if (data.success) {
          setMenuItems(data.data);
          const uniqueCategories = ['All', ...new Set(data.data.map(item => item.category))];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error('[Menu Error] Failed to fetch menu:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Filtering Logic
  const filteredItems = menuItems.filter(item => {
    const isVeg = !['chicken', 'tikka', 'tiramisu', 'beef', 'fish', 'egg', 'mutton', 'non veg', 'kebab'].some(word => 
      item.name.toLowerCase().includes(word) || item.category.toLowerCase().includes(word)
    );

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiet = dietaryFilter === 'All' || (dietaryFilter === 'Veg' && isVeg) || (dietaryFilter === 'NonVeg' && !isVeg);
    
    return matchesCategory && matchesSearch && matchesDiet && item.isAvailable;
  });

  const getQuantity = (itemId) => {
    const cartItem = cart.find(c => c._id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header Panel */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md shadow-lg px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black font-sans tracking-tight text-white flex items-center gap-2">
            <span>Elaichi Restaurant</span>
            <img 
              src="/elachisvg.png"
              onError={(e) => {
                e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/02017_0119_Kardamom%2C_Winter_in_den_Beskiden.jpg/120px-02017_0119_Kardamom%2C_Winter_in_den_Beskiden.jpg";
              }}
              alt="Elaichi Logo" 
              className="w-8 h-8 object-contain drop-shadow-md"
            />
          </h1>
          <p className="text-[11px] text-slate-400 font-bold tracking-wide mt-0.5">
            {tableNumber ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
                Table {tableNumber} Active
              </span>
            ) : (
              <span className="text-amber-400">Scan Table QR to Order</span>
            )}
          </p>
        </div>
        
        {/* Quick Cart button */}
        {cartCount > 0 && (
          <button 
            onClick={() => navigate('/cart')}
            className="relative p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-transform active:scale-95 border border-white/10"
          >
            <ShoppingBag size={20} />
            <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
              {cartCount}
            </span>
          </button>
        )}
      </header>

      {/* Errors Banner */}
      {tableError && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2.5 text-sm">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div>
            <span className="font-semibold text-red-800">QR Table Error:</span> {tableError}
          </div>
        </div>
      )}

      {/* Search Input Box */}
      <div className="px-4 mt-5">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search for your favorite dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 shadow-sm text-sm text-slate-800 transition-all font-medium"
          />
          <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
        </div>
      </div>

      {/* Dietary Filters */}
      <div className="px-4 mt-4 flex items-center gap-3">
        <button 
          onClick={() => setDietaryFilter(dietaryFilter === 'Veg' ? 'All' : 'Veg')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 flex items-center justify-center gap-2 ${dietaryFilter === 'Veg' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm shadow-emerald-500/20' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
        >
          <span className="w-3.5 h-3.5 border-2 border-emerald-600 p-0.5 flex items-center justify-center rounded-sm"><span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span></span>
          Pure Veg
        </button>
        <button 
          onClick={() => setDietaryFilter(dietaryFilter === 'NonVeg' ? 'All' : 'NonVeg')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 flex items-center justify-center gap-2 ${dietaryFilter === 'NonVeg' ? 'bg-red-50 border-red-500 text-red-700 shadow-sm shadow-red-500/20' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
        >
          <span className="w-3.5 h-3.5 border-2 border-red-600 p-0.5 flex items-center justify-center rounded-sm"><span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span></span>
          Non-Veg
        </button>
      </div>

      {/* Category Horizontal Bar */}
      <div className="mt-5 px-4 overflow-x-auto no-scrollbar flex gap-2.5 scroll-smooth pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-5 py-2.5 rounded-full text-[11px] font-black tracking-wider uppercase transition-all duration-300 ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105'
                : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-200/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Cards List */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-bold text-slate-800 mb-4 font-sans tracking-tight">
          {selectedCategory === 'All' ? 'Popular Highlights' : selectedCategory}
          <span className="text-xs text-slate-400 ml-2 font-normal">({filteredItems.length} dishes)</span>
        </h2>

        {loading ? (
          // Skeleton loaders for slow network simulation
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-3 rounded-2xl flex gap-3 border border-slate-100 animate-pulse">
                <div className="w-24 h-24 bg-slate-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 mt-1">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-1/4 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center mt-4 shadow-sm">
            <p className="text-slate-400 font-medium text-sm">No dishes match your filters.</p>
            <button 
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-3 text-xs text-brand-600 font-bold border border-brand-100 px-3 py-1.5 rounded-lg hover:bg-brand-50"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const qty = getQuantity(item._id);
              // Sync with upper filtering logic
              const isVeg = !['chicken', 'tikka', 'tiramisu', 'beef', 'fish', 'egg', 'mutton', 'non veg', 'kebab'].some(word => 
                item.name.toLowerCase().includes(word) || item.category.toLowerCase().includes(word)
              );

              return (
                <div 
                  key={item._id} 
                  className="bg-white rounded-3xl p-3.5 flex gap-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 border border-slate-100"
                >
                  {/* Food Image */}
                  <div className="relative w-[110px] h-[110px] rounded-2xl shrink-0 overflow-hidden bg-slate-100 shadow-inner">
                    {item.image ? (
                      <img 
                        src={item.image.startsWith('/uploads/') ? `${API_BASE_URL}${item.image}` : item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-500 font-bold text-xl">
                        🍳
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-black text-slate-800 text-[15px] font-sans tracking-tight leading-tight">{item.name}</h3>
                        <span className={isVeg ? 'veg-badge mt-0.5 shrink-0' : 'inline-flex items-center justify-center w-3.5 h-3.5 border-1.5 border-red-600 p-1 text-[8px] text-red-600 font-black rounded-sm mt-0.5 shrink-0'}>
                          {!isVeg && <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1 font-medium">{item.description || 'Deliciously crafted with premium ingredients.'}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="font-black text-base text-slate-900">₹{item.price.toFixed(2)}</span>
                      
                      {/* Quantity Controls */}
                      {qty > 0 ? (
                        <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 px-2 py-1.5 rounded-2xl">
                          <button 
                            onClick={() => removeFromCart(item._id)}
                            className="p-1 bg-white text-brand-600 rounded-xl active:scale-90 transition-transform shadow-sm"
                          >
                            <Minus size={14} strokeWidth={3} />
                          </button>
                          <span className="text-sm font-black text-brand-700 min-w-[20px] text-center">{qty}</span>
                          <button 
                            onClick={() => addToCart(item)}
                            className="p-1 bg-brand-500 text-white rounded-xl active:scale-90 transition-transform shadow-sm shadow-brand-500/30"
                          >
                            <Plus size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5 shadow-md shadow-slate-900/10"
                        >
                          <Plus size={14} strokeWidth={3} />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 shadow-lg shadow-slate-900/10 animate-slide-up flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold leading-none">{cartCount} {cartCount === 1 ? 'Item' : 'Items'} Added</p>
              <p className="text-base font-black text-slate-800 mt-1">₹{cartTotal.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-brand-500/20"
          >
            Review Order
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
