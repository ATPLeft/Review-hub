import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProductCatalog from './pages/ProductCatalog';
import ProductDetail from './pages/ProductDetail';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ModerationDashboard from './pages/ModerationDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<ProductCatalog />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/moderation" element={<ModerationDashboard />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
