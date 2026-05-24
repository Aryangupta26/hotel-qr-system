import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';

// Customer Pages
import MenuPage from './pages/Customer/MenuPage';
import CartPage from './pages/Customer/CartPage';
import OrderStatusPage from './pages/Customer/OrderStatusPage';

// Admin Pages
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import MenuManagement from './pages/Admin/MenuManagement';
import TableManagement from './pages/Admin/TableManagement';

// Kitchen Page
import KitchenDashboard from './pages/Kitchen/KitchenDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-500 selection:text-white">
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<MenuPage />} />
                <Route path="/table/:tableId" element={<MenuPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/order-status/:orderId" element={<OrderStatusPage />} />

                {/* Kitchen Routes */}
                <Route path="/kitchen" element={<KitchenDashboard />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/menu" element={<MenuManagement />} />
                <Route path="/admin/tables" element={<TableManagement />} />

                {/* Catch-all Fallback Redirect to Customer Menu */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
