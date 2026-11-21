import { useState } from 'react';
import { Film } from 'lucide-react';

interface CartoonPosterProps {
  src: string | null;
  title: string;
  className?: string;
}

export function CartoonPoster({ src, title, className = '' }: CartoonPosterProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-teal-50/60 to-slate-200 text-slate-500 p-4 text-center select-none ${className}`}
        role="img"
        aria-label={`${title} poster fallback`}
      >
        <Film className="w-8 h-8 text-teal-700/60 mb-2" strokeWidth={1.5} />
        <span className="text-xs font-medium text-slate-700 line-clamp-2 max-w-[14ch]">
          {title}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${title} poster`}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-cover bg-slate-100 ${className}`}
      loading="lazy"
    />
  );
}
