import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Coffee, Layers, ListCollapse, LogOut, Activity, Plus, Edit2, Trash2, X, Upload, CheckCircle2 
} from 'lucide-react';

const MenuManagement = () => {
  const navigate = useNavigate();
  const { logout, token, API_BASE_URL } = useAuth();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Starters');
  const [image, setImage] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  
  // File Uploader Fields
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Session guard
  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    }
  }, [token]);

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu`);
      const data = await res.json();
      if (data.success) {
        setMenuItems(data.data);
      }
    } catch (err) {
      console.error('[Menu CRUD] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMenu();
    }
  }, [token]);

  // Open Modal helpers
  const openCreateModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setImage('');
    setIsAvailable(true);
    setUploadError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategory(item.category);
    setImage(item.image);
    setIsAvailable(item.isAvailable);
    setUploadError('');
    setIsModalOpen(true);
  };

  // Handle Dual Mode local/Cloudinary File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/menu/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setImage(data.url);
        console.log('[Upload success] File available at:', data.url);
      } else {
        setUploadError(data.message || 'File upload failed');
      }
    } catch (err) {
      setUploadError('Failed to upload image. Server disconnected.');
    } finally {
      setUploading(false);
    }
  };

  // Submit Menu Item handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !price.trim() || !category) {
      alert('Please fill out all required details.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      image,
      isAvailable
    };

    try {
      const url = editingItem 
        ? `${API_BASE_URL}/api/menu/${editingItem._id}` 
        : `${API_BASE_URL}/api/menu`;
      
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setIsModalOpen(false);
        fetchMenu(); // Refresh table catalog
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      alert('API transaction failed.');
    }
  };

  // Toggle item availability immediately from catalog row click
  const toggleAvailability = async (item) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !item.isAvailable })
      });
      const data = await res.json();
      if (data.success) {
        fetchMenu();
      }
    } catch (err) {
      console.error('[Menu Toggle] Error:', err.message);
    }
  };

  // Delete Dish handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this dish?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchMenu();
      }
    } catch (err) {
      console.error('[Menu CRUD] Deletion failed:', err.message);
    }
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
            className="flex items-center gap-3 px-4 py-3 bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/10"
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

      {/* Main panel */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Food Menu Management</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Add, update, or hide appetizers, mains, drinks, and desserts.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5 shadow-md shadow-brand-500/10"
          >
            <Plus size={16} />
            <span>Create Food Item</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Dish Image</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                  {menuItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                        Your menu is empty. Create your first food item!
                      </td>
                    </tr>
                  ) : (
                    menuItems.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 pl-2">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                            {item.image ? (
                              <img 
                                src={item.image.startsWith('/uploads/') ? `${API_BASE_URL}${item.image}` : item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=150';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-500 font-bold text-sm">
                                🍳
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 font-bold text-slate-800 pr-4">
                          <div>{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[240px] mt-0.5">{item.description}</div>
                        </td>
                        <td className="py-3">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200/50 text-[10px] font-bold">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 font-extrabold text-slate-800">₹{item.price.toFixed(2)}</td>
                        <td className="py-3">
                          <button
                            onClick={() => toggleAvailability(item)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[9px] font-extrabold border ${
                              item.isAvailable
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : 'bg-red-50 text-red-500 border-red-100'
                            }`}
                          >
                            <span className={`w-1 h-1 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {item.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}
                          </button>
                        </td>
                        <td className="py-3 text-right pr-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit item"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* CRUD Edit/Create Modal Panel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 animate-fade-in">
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800">
                {editingItem ? 'Edit Culinary Dish' : 'Add New Culinary Dish'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Garlic Butter Lobster"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 18.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs text-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thali, Egg, Main Course"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs text-slate-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Culinary Description
                </label>
                <textarea
                  rows="2.5"
                  placeholder="Describe key ingredients, spices, allergen notes, portion sizing..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs text-slate-700 leading-relaxed"
                />
              </div>

              {/* Image Input and File Uploader */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Food Cover Image
                  </label>
                  {image && (
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded font-bold border border-emerald-100 flex items-center gap-0.5">
                      <CheckCircle2 size={10} />
                      <span>Ready</span>
                    </span>
                  )}
                </div>

                {/* Upload Action */}
                <div className="flex gap-4.5 items-center">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                    {image ? (
                      <img 
                        src={image.startsWith('/uploads/') ? `${API_BASE_URL}${image}` : image} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span>Empty</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className={`w-full py-2.5 border border-dashed rounded-xl flex items-center justify-center gap-2 cursor-pointer text-[10px] font-bold tracking-wide uppercase transition-colors ${
                      uploading ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white border-brand-500/30 text-brand-600 hover:bg-brand-50'
                    }`}>
                      <Upload size={14} />
                      <span>{uploading ? 'Transmitting image...' : 'Upload Image File'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        disabled={uploading}
                      />
                    </label>
                    
                    {/* Error labels */}
                    {uploadError && <p className="text-[9px] text-red-500 font-bold">{uploadError}</p>}
                    
                    <p className="text-[9px] text-slate-400 leading-normal">Or paste direct internet image URL below:</p>
                  </div>
                </div>

                <input
                  type="url"
                  placeholder="https://example.com/food-image.jpg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs text-slate-700"
                />
              </div>

              {/* Toggle in stock checkbox */}
              <div className="flex items-center gap-2.5">
                <input
                  id="availability-check"
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4.5 h-4.5 text-brand-500 border-slate-300 rounded-md focus:ring-brand-500 accent-brand-500 shrink-0"
                />
                <label htmlFor="availability-check" className="text-xs font-bold text-slate-700 cursor-pointer">
                  In Stock (Available for table orders immediately)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 hover:bg-slate-100 text-slate-500 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 active:scale-95 transition-transform"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
