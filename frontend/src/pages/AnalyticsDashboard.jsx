import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTopProducts, getSentiment } from '../api';
import { useAuth } from '../context/AuthContext';
import { StarDisplay } from '../components/StarRating';
import { BarChart2, TrendingUp, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';

function StatCard({ icon, label, value, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function SentimentBar({ score }) {
  const pct = Math.round(score * 100);
  let color = 'bg-green-400';
  if (pct < 40) color = 'bg-red-400';
  else if (pct < 70) color = 'bg-amber-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topProducts, setTopProducts] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'manager') { navigate('/'); return; }
    Promise.all([getTopProducts(), getSentiment()])
      .then(([pRes, sRes]) => {
        setTopProducts(pRes.data);
        setSentiment(sRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 size={22} className="text-green-500" />
          Manager Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">Platform-wide review metrics and top-performing products</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-28 border border-gray-100" />)}
        </div>
      ) : sentiment && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<MessageSquare size={16} />}
              label="Total Reviews"
              value={sentiment.total_reviews}
              color="indigo"
            />
            <StatCard
              icon={<CheckCircle size={16} />}
              label="Approved"
              value={sentiment.approved}
              color="green"
            />
            <StatCard
              icon={<Clock size={16} />}
              label="Pending"
              value={sentiment.pending}
              color="amber"
            />
            <StatCard
              icon={<XCircle size={16} />}
              label="Rejected"
              value={sentiment.rejected}
              color="red"
            />
          </div>

          {/* Sentiment overview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-500" />
              Platform Sentiment Score
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <SentimentBar score={sentiment.avg_sentiment} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(sentiment.avg_sentiment * 100)}%
                </p>
                <p className="text-xs text-gray-500">average sentiment</p>
              </div>
            </div>

            {/* Review status pie-like display */}
            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
              {[
                { label: 'Approved', count: sentiment.approved, color: 'bg-green-400' },
                { label: 'Pending', count: sentiment.pending, color: 'bg-amber-400' },
                { label: 'Rejected', count: sentiment.rejected, color: 'bg-red-400' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${s.color}`} />
                  <div>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="font-semibold text-gray-800">{s.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Top Products */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" />
            Top Rated Products
          </h2>
        </div>
        {loading ? (
          <div className="p-5 space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-lg" />)}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {topProducts.map((product, idx) => (
              <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{product.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <StarDisplay rating={product.average_rating} size={12} showValue />
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MessageSquare size={10} />
                      {product.total_reviews}
                    </span>
                  </div>
                </div>
                {/* Bar chart visualization */}
                <div className="w-32 hidden sm:block">
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${(product.average_rating / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
