import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const DEMO_ACCOUNTS = [
    { label: 'Customer', email: 'alice@example.com', password: 'password123' },
    { label: 'Moderator', email: 'dave@example.com', password: 'password123' },
    { label: 'Manager', email: 'eve@example.com', password: 'password123' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'moderator') navigate('/moderation');
      else if (user.role === 'manager') navigate('/analytics');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email, password) => {
    setForm({ email, password });
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'moderator') navigate('/moderation');
      else if (user.role === 'manager') navigate('/analytics');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-2xl">
            <ShoppingBag size={28} />
            <span>ReviewHub</span>
          </div>
          <p className="mt-2 text-gray-500 text-sm">Sign in to your account</p>
        </div>

        {/* Quick login */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Demo Login</p>
          <div className="flex gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.label}
                onClick={() => quickLogin(a.email, a.password)}
                className="flex-1 py-1.5 text-sm rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
