import { Star } from 'lucide-react';

interface StarRatingInputProps {
  value: number;
  onChange: (score: number) => void;
  disabled?: boolean;
  label?: string;
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
  label = 'Parent rating',
}: StarRatingInputProps) {
  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            aria-label={`Rate ${star} out of 5 stars`}
            className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <Star
              className={`w-4 h-4 ${
                filled
                  ? 'fill-amber-500 text-amber-500'
                  : 'text-slate-300 hover:text-amber-400'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
