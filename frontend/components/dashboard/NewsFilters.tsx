"use client";

import {
  Search,
  RotateCcw,
  Filter,
  MapPin,
  Tag,
  Smile,
  AlertTriangle,
} from "lucide-react";

export interface NewsFilterState {
  keyword: string;
  category: string;
  location: string;
  sentiment: string;
  urgency: string;
}

interface NewsFiltersProps {
  filters: NewsFilterState;
  onChange: (filters: NewsFilterState) => void;
  onReset: () => void;
}

const SENTIMENT_OPTIONS = [
  { value: "", label: "Semua Sentiment" },
  { value: "Positive", label: "Positive" },
  { value: "Neutral", label: "Neutral" },
  { value: "Negative", label: "Negative" },
];

const URGENCY_OPTIONS = [
  { value: "", label: "Semua Urgensi" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

export default function NewsFilters({
  filters,
  onChange,
  onReset,
}: NewsFiltersProps) {
  const updateFilter = (
    key: keyof NewsFilterState,
    value: string
  ) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters =
    filters.keyword ||
    filters.category ||
    filters.location ||
    filters.sentiment ||
    filters.urgency;

  return (
    <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/60 p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400" />

          <span className="text-xs font-semibold text-zinc-200">
            Filter Berita
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-red-400 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Keyword */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -tranzinc-y-1/2 w-4 h-4 text-zinc-500" />

        <input
          type="text"
          value={filters.keyword}
          onChange={(e) =>
            updateFilter("keyword", e.target.value)
          }
          placeholder="Cari keyword berita..."
          className="w-full pl-9 pr-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Category */}
      <div className="relative">
        <Tag className="absolute left-3 top-1/2 -tranzinc-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />

        <input
          type="text"
          value={filters.category}
          onChange={(e) =>
            updateFilter("category", e.target.value)
          }
          placeholder="Kategori..."
          className="w-full pl-9 pr-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Location */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -tranzinc-y-1/2 w-4 h-4 text-zinc-500" />

        <input
          type="text"
          value={filters.location}
          onChange={(e) =>
            updateFilter("location", e.target.value)
          }
          placeholder="Lokasi..."
          className="w-full pl-9 pr-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Sentiment + Urgency */}
      <div className="grid grid-cols-2 gap-2">
        {/* Sentiment */}
        <div className="relative">
          <Smile className="absolute left-3 top-1/2 -tranzinc-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />

          <select
            value={filters.sentiment}
            onChange={(e) =>
              updateFilter("sentiment", e.target.value)
            }
            className="w-full appearance-none pl-9 pr-2 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {SENTIMENT_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-zinc-800"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Urgency */}
        <div className="relative">
          <AlertTriangle className="absolute left-3 top-1/2 -tranzinc-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />

          <select
            value={filters.urgency}
            onChange={(e) =>
              updateFilter("urgency", e.target.value)
            }
            className="w-full appearance-none pl-9 pr-2 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {URGENCY_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-zinc-800"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}