import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, LogOut, User, Shield, BarChart2 } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleColor = {
    customer: 'bg-blue-100 text-blue-700',
    moderator: 'bg-purple-100 text-purple-700',
    manager: 'bg-green-100 text-green-700',
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <ShoppingBag size={22} />
            <span>ReviewHub</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Products</Link>
            {user && (
              <Link to="/profile" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <User size={15} /> Profile
              </Link>
            )}
            {user && (user.role === 'moderator' || user.role === 'manager') && (
              <Link to="/moderation" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <Shield size={15} /> Moderation
              </Link>
            )}
            {user && user.role === 'manager' && (
              <Link to="/analytics" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <BarChart2 size={15} /> Analytics
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${roleColor[user.role] || 'bg-gray-100 text-gray-700'}`}>
                  {user.role}
                </span>
                <span className="text-sm text-gray-700 hidden sm:block">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium px-4 py-1.5 rounded-lg text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
