"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Newspaper,
  AlertTriangle,
  ExternalLink,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar, // 🔥 Added Calendar icon
} from "lucide-react";
import L from "leaflet";
import NewsMap from "@/components/NewsMap";
import { AIResultNews, PaginationMeta } from "@/types/news";
import { useAuth } from "@/context/AuthContext";
import { newsApi } from "@/services/api";
import Link from "next/link";

// Helper fungsi untuk format tanggal Indonesia
const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return null;
  }
};

export default function DashboardPage() {
  console.log("🟣🟣🟣 DASHBOARD RENDER");
  
  const { user, logout } = useAuth();
  
  // State Data Berita & Pagination
  const [newsList, setNewsList] = useState<AIResultNews[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // State Peta & Filter
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [selectedNews, setSelectedNews] = useState<AIResultNews | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: 500,
        search: searchQuery || undefined,
        ...(mapBounds && {
          sw_lat: mapBounds.getSouthWest().lat,
          sw_lng: mapBounds.getSouthWest().lng,
          ne_lat: mapBounds.getNorthEast().lat,
          ne_lng: mapBounds.getNorthEast().lng,
        }),
      };

      const res = await newsApi.getNews(params);

      setNewsList(res.data);
      setPagination(res.pagination);
    } catch (error) {
      console.error("Gagal mengambil data berita:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, mapBounds, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNews();
    }, 400);

    return () => clearTimeout(timer);
  }, [fetchNews]);

  const handleBoundsChange = useCallback(
    (bounds: L.LatLngBounds) => {
      setMapBounds(bounds);
      setCurrentPage(1);
    },
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1);
    },
    []
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col h-screen overflow-hidden">
      {/* Navbar Atas */}
      <header className="h-16 bg-slate-800 border-b border-slate-700 px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-wide">GIS News Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-xs">
            <p className="font-semibold text-slate-200">{user?.name || "User"}</p>
            <p className="text-slate-400">@{user?.username || "username"}</p>
          </div>
          <Link
            href={"/login"}
            onClick={logout}
            className="p-2 bg-slate-700 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-colors"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* KIRI: Peta Interaktif Leaflet */}
        <div className="flex-1 relative flex flex-col bg-slate-800/50 rounded-2xl border border-slate-700/80 p-2 overflow-hidden shadow-2xl">
          <NewsMap
            newsList={newsList}
            selectedNews={selectedNews}
            onBoundsChange={handleBoundsChange}
            onSelectNews={setSelectedNews}
          />
        </div>

        {/* KANAN: Sidebar Daftar Berita */}
        <div className="w-96 flex flex-col bg-slate-800/80 rounded-2xl border border-slate-700/80 p-4 shrink-0 shadow-2xl backdrop-blur-sm">
          {/* Header Sidebar & Input Pencarian */}
          <div className="mb-4 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>Berita Terkait</span>
              </h2>
              {pagination && (
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full border border-indigo-500/30">
                  Total: {pagination.totalData}
                </span>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari berita atau lokasi..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* List Card Berita */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span>Memuat data...</span>
              </div>
            ) : newsList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                Tidak ada berita ditemukan pada area ini.
              </div>
            ) : (
              <AnimatePresence>
                {newsList.map((news) => {
                  const isSelected = selectedNews?._id === news._id;
                  const formattedDate = formatDate(news.created_at);

                  return (
                    <motion.div
                      key={news._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedNews(news)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10"
                          : "bg-slate-900/60 border-slate-700/60 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {news.category || "Berita"}
                        </span>

                        {news.urgency && (
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                              news.urgency.toLowerCase() === "high"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : news.urgency.toLowerCase() === "medium"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {news.urgency}
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-sm leading-snug text-slate-100 line-clamp-2 mb-2">
                        {news.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {news.content}
                      </p>

                      {/* Footer Kartu Berita */}
                      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span className="truncate max-w-[130px]">{news.location || "N/A"}</span>
                          </span>

                          {formattedDate && (
                            <span className="flex items-center gap-1 text-slate-400 shrink-0">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {formattedDate}
                            </span>
                          )}
                        </div>

                        {news.source && (
                          <div className="flex justify-end">
                            <span className="flex items-center gap-1 text-indigo-400 hover:underline">
                              {news.source} <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Controls Pagination */}
          {pagination && pagination.totalPage > 1 && (
            <div className="pt-3 mt-2 border-t border-slate-700/80 flex items-center justify-between shrink-0 text-xs">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrevPage || loading}
                className="p-2 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <span className="text-slate-400">
                Halaman <strong className="text-white">{pagination.currentPage}</strong> dari{" "}
                <strong className="text-white">{pagination.totalPage}</strong>
              </span>

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="p-2 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}