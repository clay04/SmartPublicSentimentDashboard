"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ExternalLink,
  MapPin,
} from "lucide-react";

import { AIResultNews } from "@/types/news";

interface NewsCardProps {
  news: AIResultNews;
  selected: boolean;
  onSelect: () => void;
}

export default function NewsCard({
  news,
  selected,
  onSelect,
}: NewsCardProps) {
  const urgency = news.urgency?.toLowerCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onSelect}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        selected
          ? "bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10"
          : "bg-zinc-900/60 border-zinc-700/60 hover:border-zinc-600"
      }`}
    >
      <div className="flex items-center justify-between mb-2">

        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
          {news.category || "Berita"}
        </span>

        {news.urgency && (
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
              urgency === "high"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : urgency === "medium"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            {news.urgency}
          </span>
        )}

      </div>

      <h3 className="font-semibold text-sm leading-snug text-zinc-100 line-clamp-2 mb-2">
        {news.title}
      </h3>

      <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
        {news.content}
      </p>

      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">

        <span className="flex items-center gap-1 truncate">
          <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
          {news.location || "Tidak diketahui"}
        </span>

        {news.source && (
          <span className="flex items-center gap-1 text-indigo-400">
            {news.source}
            <ExternalLink className="w-2.5 h-2.5" />
          </span>
        )}

      </div>
    </motion.div>
  );
}