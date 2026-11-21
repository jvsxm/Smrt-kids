import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ChildSwitcher() {
  const { childrenList, activeChild, setActiveChildId } = useAuth();

  if (childrenList.length === 0) {
    return (
      <div className="flex items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            No child profiles yet
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Create a profile with a birth date and preferred genres to personalize cartoon recommendations.
          </p>
        </div>
        <Link
          to="/children"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg whitespace-nowrap shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Add Child Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div
        role="tablist"
        aria-label="Select child profile"
        className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl"
      >
        {childrenList.map((child) => {
          const isActive = activeChild?.id === child.id;
          return (
            <button
              key={child.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveChildId(child.id)}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {child.nickname} · {child.age}y
            </button>
          );
        })}
      </div>

      <Link
        to="/children"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 hover:text-teal-900 whitespace-nowrap shrink-0"
      >
        <UserPlus className="w-4 h-4" />
        Manage Profiles
      </Link>
    </div>
  );
}
