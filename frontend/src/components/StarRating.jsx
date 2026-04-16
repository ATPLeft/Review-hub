import { Star } from 'lucide-react';

export function StarDisplay({ rating, size = 16, showValue = false }) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-gray-700">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </span>
  );
}

export function StarInput({ value, onChange }) {
  return (
    <span className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="focus:outline-none"
        >
          <Star
            size={28}
            className={
              i <= value
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300 hover:text-amber-300'
            }
          />
        </button>
      ))}
    </span>
  );
}
