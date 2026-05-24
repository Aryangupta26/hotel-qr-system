import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, user, error: authError } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Protect route - if already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim() || !password.trim()) {
      setLocalError('Please fill in all credential fields.');
      return;
    }

    setLoading(true);
    const success = await login(username, password);
    setLoading(false);

    if (success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="text-4xl">🔐</span>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-white font-sans">
          Elaichi Admin Panel
        </h2>
        <p className="mt-1.5 text-xs text-slate-400 font-medium">
          Secure staff login for ordering systems and kitchen panels
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6.5 sm:p-8 shadow-2xl backdrop-blur-md">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Input field validation warnings */}
            {(localError || authError) && (
              <div className="bg-red-950/30 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-start gap-2 text-xs">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <span className="font-semibold">{localError || authError}</span>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Staff Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="e.g. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm text-slate-200"
                />
                <User className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Secret Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm text-slate-200"
                />
                <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center ${
                  loading
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/10 active:scale-[0.98]'
                }`}
              >
                {loading ? 'Validating Token...' : 'Access Dashboard'}
              </button>
            </div>
          </form>

          {/* Quick Sandbox Help Panel */}
          <div className="mt-8 border-t border-slate-900 pt-5 text-center">
            <span className="inline-block text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase tracking-wider mb-2">
              Default Sandbox Credentials
            </span>
            <div className="text-[10px] text-slate-400 font-medium space-y-0.5">
              <p>Username: <code className="text-brand-400 font-mono">admin</code></p>
              <p>Password: <code className="text-brand-400 font-mono">admin123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
