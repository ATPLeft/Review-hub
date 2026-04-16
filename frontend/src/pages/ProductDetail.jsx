import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, getProductReviews, createReview } from '../api';
import { useAuth } from '../context/AuthContext';
import { StarDisplay, StarInput } from '../components/StarRating';
import SentimentBadge from '../components/SentimentBadge';
import { ArrowLeft, Share2, MessageSquare, CheckCircle, Clock } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review form
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = () => {
    Promise.all([getProduct(id), getProductReviews(id)])
      .then(([pRes, rRes]) => {
        setProduct(pRes.data);
        setReviews(rRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating) { setSubmitError('Please select a star rating.'); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      await createReview({ product_id: Number(id), rating, review_text: reviewText });
      setSubmitSuccess(true);
      setRating(0);
      setReviewText('');
      load();
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">Loading…</div>
    );
  }

  if (!product) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">Product not found.</div>;
  }

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 mb-6">
        <ArrowLeft size={15} /> Back to catalog
      </Link>

      {/* Product header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="sm:flex">
          <div className="sm:w-72 flex-shrink-0">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-56 sm:h-full object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Product'; }}
            />
          </div>
          <div className="p-6 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{product.description}</p>
              <div className="flex items-center gap-3 mb-2">
                <StarDisplay rating={product.average_rating} size={20} showValue />
                <span className="text-sm text-gray-500">
                  ({product.total_reviews} {product.total_reviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              {/* Rating breakdown */}
              <div className="mt-3 space-y-1">
                {ratingCounts.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-4 text-right text-gray-500">{star}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="w-4 text-gray-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 w-fit transition-colors"
              onClick={() => alert('Share link copied! (placeholder)')}
            >
              <Share2 size={14} /> Share Product
            </button>
          </div>
        </div>
      </div>

      {/* Review form */}
      {user ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-500" />
            Write a Review
          </h2>
          {submitSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm mb-4">
              <CheckCircle size={16} /> Review submitted! It will appear after moderation.
            </div>
          )}
          {submitError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">{submitError}</div>
          )}
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Rating</label>
              <StarInput value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Review (optional)</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                placeholder="Share your experience with this product…"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5 mb-6 text-center">
          <p className="text-indigo-700 text-sm">
            <Link to="/login" className="font-semibold underline">Sign in</Link> to submit a review
          </p>
        </div>
      )}

      {/* Reviews list */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Customer Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            No approved reviews yet. Be the first to review!
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{review.user.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarDisplay rating={review.rating} size={14} />
                    <SentimentBadge score={review.sentiment_score} />
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
    </div>
  );
}
