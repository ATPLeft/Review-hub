import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api';
import { StarDisplay } from '../components/StarRating';
import { Search, SlidersHorizontal, MessageSquare } from 'lucide-react';

export default function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('highest_rated');
  const [minRating, setMinRating] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = { sort };
    if (minRating) params.min_rating = minRating;
    getProducts(params)
      .then((res) => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sort, minRating]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
        <p className="text-gray-500 mt-1">Browse and review our latest products</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <div className="flex items-center gap-2 text-gray-700 font-semibold mb-4">
              <SlidersHorizontal size={16} />
              <span>Filters & Sort</span>
            </div>

            {/* Search */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Search
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Product name…"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Sort by
              </label>
              <div className="space-y-1">
                {[
                  { value: 'highest_rated', label: '⭐ Highest Rated' },
                  { value: 'most_reviewed', label: '💬 Most Reviewed' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      sort === opt.value
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Min rating */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Minimum Rating
              </label>
              <div className="space-y-1">
                {['', '3', '4', '4.5'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setMinRating(val)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      minRating === val
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {val === '' ? 'All ratings' : `${val}+ stars`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 h-72 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No products found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden group"
                >
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x225?text=Product'; }}
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold text-gray-900 text-base leading-snug mb-1 line-clamp-2">
                      {product.name}
                    </h2>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <StarDisplay rating={product.average_rating} showValue />
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MessageSquare size={12} />
                        {product.total_reviews}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
