export default function SentimentBadge({ score }) {
  const pct = Math.round(score * 100);
  let label, color;
  if (pct >= 70) { label = 'Positive'; color = 'bg-green-100 text-green-700'; }
  else if (pct >= 40) { label = 'Neutral'; color = 'bg-yellow-100 text-yellow-700'; }
  else { label = 'Negative'; color = 'bg-red-100 text-red-700'; }

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {label} ({pct}%)
    </span>
  );
}
