import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingReviews, updateReviewStatus } from '../api';
import { useAuth } from '../context/AuthContext';
import { StarDisplay } from '../components/StarRating';
import SentimentBadge from '../components/SentimentBadge';
import { Shield, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

export default function ModerationDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMap, setActionMap] = useState({});

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'moderator' && user.role !== 'manager') {
      navigate('/'); return;
    }
    load();
  }, [user]);

  const load = () => {
    setLoading(true);
    getPendingReviews()
      .then((res) => setReviews(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleAction = async (reviewId, status) => {
    setActionMap((m) => ({ ...m, [reviewId]: status }));
    try {
      await updateReviewStatus(reviewId, status);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      console.error(err);
    } finally {
      setActionMap((m) => {
        const copy = { ...m };
        delete copy[reviewId];
        return copy;
      });
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={22} className="text-purple-500" />
            Moderation Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review and approve or reject pending submissions</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats bar */}
      <div className="bg-purple-50 rounded-xl border border-purple-100 p-4 mb-6 flex items-center gap-2">
        <Clock size={16} className="text-purple-500" />
        <span className="text-sm font-medium text-purple-700">
          {loading ? '…' : reviews.length} review{reviews.length !== 1 ? 's' : ''} awaiting moderation
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">All caught up! No pending reviews.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Reviewer</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Review</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Sentiment</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 font-medium text-gray-800">{review.user.name}</td>
                  <td className="px-4 py-4 text-gray-500 text-xs">Product #{review.product_id}</td>
                  <td className="px-4 py-4 max-w-xs">
                    <p className="text-gray-600 text-xs line-clamp-2">{review.review_text || '(no text)'}</p>
                  </td>
                  <td className="px-4 py-4">
                    <StarDisplay rating={review.rating} size={12} />
                  </td>
                  <td className="px-4 py-4">
                    <SentimentBadge score={review.sentiment_score} />
                  </td>
                  <td className="px-4 py-4 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(review.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleAction(review.id, 'approved')}
                        disabled={!!actionMap[review.id]}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle size={12} />
                        {actionMap[review.id] === 'approved' ? 'Approving…' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleAction(review.id, 'rejected')}
                        disabled={!!actionMap[review.id]}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        <XCircle size={12} />
                        {actionMap[review.id] === 'rejected' ? 'Rejecting…' : 'Reject'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
