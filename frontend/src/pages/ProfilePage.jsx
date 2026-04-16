import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyReviews } from '../api';
import { useAuth } from '../context/AuthContext';
import { StarDisplay } from '../components/StarRating';
import SentimentBadge from '../components/SentimentBadge';
import { User, Clock, CheckCircle, XCircle } from 'lucide-react';

const statusIcon = {
  pending: <Clock size={14} className="text-amber-500" />,
  approved: <CheckCircle size={14} className="text-green-500" />,
  rejected: <XCircle size={14} className="text-red-500" />,
};

const statusColor = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    getMyReviews()
      .then((res) => setReviews(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const stats = {
    total: reviews.length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
    avgRating: reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0,
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
            <User size={24} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full capitalize">
              {user.role}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
          {[
            { label: 'Total Reviews', value: stats.total },
            { label: 'Approved', value: stats.approved },
            { label: 'Pending', value: stats.pending },
            { label: 'Avg Rating', value: stats.avgRating },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Review history */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Review History</h2>
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          You haven't submitted any reviews yet.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StarDisplay rating={review.rating} size={14} />
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor[review.status]}`}>
                    {statusIcon[review.status]}
                    {review.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <SentimentBadge score={review.sentiment_score} />
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {review.review_text && (
                <p className="text-gray-600 text-sm leading-relaxed">{review.review_text}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
