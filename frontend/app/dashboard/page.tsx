"use client";

import { useEffect, useState, useCallback } from "react";
import { Newspaper } from "lucide-react";
import L from "leaflet";

import NewsMap from "@/components/NewsMap";

import {
  AIResultNews,
  PaginationMeta,
} from "@/types/news";

import {
  MapAction,
} from "@/types/chat";

import { useAuth } from "@/context/AuthContext";
import { newsApi, chatApi } from "@/services/api";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import NewsSidebar from "@/components/dashboard/NewsSidebar";
import NewsChatbot from "@/components/dashboard/NewsChatbot";

import { ChatProvider } from "@/context/ChatContext";

import {
  NewsFilterState,
} from "@/components/dashboard/NewsFilters";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [newsSidebarWidth, setNewsSidebarWidth] =
    useState(400);

  const [filters, setFilters] =
    useState<NewsFilterState>({
      keyword: "",
      category: "",
      location: "",
      sentiment: "",
      urgency: "",
    });

  const resetFilters = useCallback(() => {
    setFilters({
      keyword: "",
      category: "",
      location: "",
      sentiment: "",
      urgency: "",
    });

    setCurrentPage(1);
  }, []);

  const [newsList, setNewsList] =
    useState<AIResultNews[]>([]);

  const [pagination, setPagination] =
    useState<PaginationMeta | null>(null);

  const [currentPage, setCurrentPage] =
    useState<number>(1);

  const [mapBounds, setMapBounds] =
    useState<L.LatLngBounds | null>(null);

  const [selectedNews, setSelectedNews] =
    useState<AIResultNews | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const fetchNews = useCallback(async () => {
    console.log("🚨 FETCH NEWS DIPANGGIL");

    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        keyword:
          filters.keyword || undefined,
        category:
          filters.category || undefined,
        location:
          filters.location || undefined,
        sentiment:
          filters.sentiment || undefined,
        urgency:
          filters.urgency || undefined,
        ...(mapBounds && {
          sw_lat:
            mapBounds.getSouthWest().lat,
          sw_lng:
            mapBounds.getSouthWest().lng,
          ne_lat:
            mapBounds.getNorthEast().lat,
          ne_lng:
            mapBounds.getNorthEast().lng,
        }),
      };
      console.log(
        "📤 NEWS PARAMS:",
        params
      );
      const res =
        await newsApi.getNews(params);
      console.log(
        "📥 NEWS RESPONSE:",
        res
      );
      setNewsList(res.data);
      setPagination(res.pagination);
    } catch (error) {
      console.error(
        "❌ Gagal mengambil data berita:",
        error
      );
      setNewsList([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    mapBounds,
    filters,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNews();
    }, 400);
    return () => {
      clearTimeout(timer);
    };
  }, [fetchNews]);

  const handleBoundsChange =
    useCallback(
      (bounds: L.LatLngBounds) => {
        console.log(
          "🗺️ MAP BOUNDS CHANGE:",
          bounds
        );
        setMapBounds(bounds);
        setCurrentPage(1);
      },
      []
    );

  const handleSelectNews =
    useCallback(
      (news: AIResultNews) => {
        console.log(
          "📰 SELECTED NEWS:",
          news
        );
        setSelectedNews(news);
      },
      []
    );

  const handlePreviousPage =
    useCallback(() => {
      setCurrentPage((prev) =>
        Math.max(prev - 1, 1)
      );
    }, []);

  const handleNextPage =
    useCallback(() => {
      setCurrentPage((prev) =>
        prev + 1
      );
    }, []);

  const [conversationId, setConversationId] =
    useState<number | null>(null);

  const [conversationLoading, setConversationLoading] =
    useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }
    let cancelled = false;
    const initializeConversation =
      async () => {
        try {
          setConversationLoading(true);
          console.log(
            "💬 Membuat conversation..."
          );
          const conversation =
            await chatApi.createConversation();
          if (cancelled) {
            return;
          }
          console.log(
            "💬 CONVERSATION CREATED:",
            conversation
          );
          setConversationId(
            conversation.id
          );
        } catch (error) {
          if (cancelled) {
            return;
          }
          console.error(
            "❌ Gagal membuat conversation:",
            error
          );
          setConversationId(null);
        } finally {
          if (!cancelled) {
            setConversationLoading(false);
          }
        }
      };
    initializeConversation();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const [mapNavigation, setMapNavigation] =
    useState<MapAction | null>(null);

  const handleMapNavigate =
    useCallback(
      (action: MapAction) => {

        console.log(
          "🗺️ MAP NAVIGATION REQUEST:",
          action
        );

        setMapNavigation(action);
      },
      []
    );

  return (
    <ChatProvider
      conversationId={conversationId}
      onMapNavigate={handleMapNavigate}
    >
      <div className="h-screen overflow-hidden bg-zinc-950 text-white flex">
        <DashboardSidebar
          open={sidebarOpen}
          onToggle={() =>
            setSidebarOpen(
              (prev) => !prev
            )
          }
          onLogout={logout}
        />
        <main className="flex-1 min-w-0 flex flex-col">

          <header className="h-16 shrink-0 bg-zinc-900 border-b border-zinc-800 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-wide">
                  Smart Public Sentiment Dashboard
                </h1>
                <p className="text-[10px] text-zinc-500">
                  Geospatial Sentiment Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-semibold text-zinc-200">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] text-zinc-500">
                  @{user?.username || "username"}
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 min-h-0 p-4 flex gap-4">
            <section className="flex-1 min-w-0 min-h-0 flex flex-col gap-3">
              <div className="flex-1 min-h-0 relative bg-zinc-800 rounded-2xl border border-zinc-700 overflow-hidden shadow-2xl">
                <NewsMap
                  newsList={newsList}
                  selectedNews={selectedNews}
                  onBoundsChange={
                    handleBoundsChange
                  }
                  onSelectNews={
                    handleSelectNews
                  }
                  mapNavigation={
                    mapNavigation
                  }
                />
              </div>
              <NewsChatbot/>
            </section>

            <NewsSidebar
              width={
                newsSidebarWidth
              }
              onWidthChange={
                setNewsSidebarWidth
              }
              newsList={
                newsList
              }
              selectedNews={
                selectedNews
              }
              onSelectNews={
                handleSelectNews
              }
              pagination={
                pagination
              }
              loading={
                loading
              }
              filters={
                filters
              }
              onFiltersChange={
                (newFilters) => {
                  setFilters(
                    newFilters
                  );
                  setCurrentPage(1);
                }
              }
              onResetFilters={
                resetFilters
              }
              currentPage={
                currentPage
              }
              onPreviousPage={
                handlePreviousPage
              }
              onNextPage={
                handleNextPage
              }
            />
          </div>
        </main>
      </div>
    </ChatProvider>
  );
}