"use client";

import { useRef } from "react";
import { MapPin, GripVertical } from "lucide-react";

import { AIResultNews, PaginationMeta } from "@/types/news";

import NewsFilters, {
  NewsFilterState,
} from "./NewsFilters";

import NewsCard from "./NewsCard";

interface NewsSidebarProps {
  width: number;
  onWidthChange: (width: number) => void;

  newsList: AIResultNews[];
  selectedNews: AIResultNews | null;
  onSelectNews: (news: AIResultNews) => void;

  pagination: PaginationMeta | null;
  loading: boolean;

  filters: NewsFilterState;
  onFiltersChange: (filters: NewsFilterState) => void;
  onResetFilters: () => void;

  currentPage: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export default function NewsSidebar({
  width,
  onWidthChange,

  newsList,
  selectedNews,
  onSelectNews,

  pagination,
  loading,

  filters,
  onFiltersChange,
  onResetFilters,

  currentPage,
  onPreviousPage,
  onNextPage,
}: NewsSidebarProps) {
  const resizing = useRef(false);

  const handleMouseDown = () => {
    resizing.current = true;

    const handleMouseMove = (event: MouseEvent) => {
      const newWidth = window.innerWidth - event.clientX;

      const clampedWidth = Math.min(
        650,
        Math.max(300, newWidth)
      );

      onWidthChange(clampedWidth);
    };

    const handleMouseUp = () => {
      resizing.current = false;

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mouseup",
        handleMouseUp
      );
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    window.addEventListener(
      "mouseup",
      handleMouseUp
    );
  };

  return (
    <aside
      style={{ width }}
      className="
        relative
        shrink-0
        h-full
        bg-zinc-800/90
        border
        border-zinc-700/80
        rounded-2xl
        overflow-hidden
        shadow-2xl
      "
    >
      {/* ========================================= */}
      {/* RESIZE HANDLE */}
      {/* ========================================= */}

      <div
        onMouseDown={handleMouseDown}
        className="
          absolute
          left-0
          top-0
          bottom-0
          w-2
          cursor-col-resize
          z-20
          flex
          items-center
          justify-center
          group
        "
      >
        <div
          className="
            h-10
            w-1
            rounded-full
            bg-zinc-700
            group-hover:bg-indigo-500
            transition-colors
          "
        />

        <GripVertical
          className="
            absolute
            w-4
            h-4
            text-zinc-600
            group-hover:text-indigo-400
          "
        />
      </div>

      {/* ========================================= */}
      {/* CONTENT */}
      {/* ========================================= */}

      <div className="h-full flex flex-col pl-3">

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="p-4 pb-3 shrink-0">

          <div className="flex items-center justify-between">

            <h2
              className="
                font-bold
                text-zinc-200
                flex
                items-center
                gap-2
              "
            >
              <MapPin className="w-4 h-4 text-indigo-400" />

              <span>Berita Terkait</span>
            </h2>

            {pagination && (
              <span
                className="
                  px-2
                  py-0.5
                  bg-indigo-500/20
                  text-indigo-400
                  text-[10px]
                  font-semibold
                  rounded-full
                  border
                  border-indigo-500/20
                "
              >
                {pagination.totalData}
              </span>
            )}

          </div>

        </div>

        {/* ========================================= */}
        {/* FILTERS */}
        {/* ========================================= */}

        <div className="px-4 pb-3 shrink-0">

          <NewsFilters
            filters={filters}
            onChange={(newFilters) => {
              onFiltersChange(newFilters);
            }}
            onReset={onResetFilters}
          />

        </div>

        {/* ========================================= */}
        {/* NEWS LIST */}
        {/* ========================================= */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-4
            pb-3
            space-y-3
            custom-scrollbar
          "
        >

          {loading ? (

            <div
              className="
                flex
                items-center
                justify-center
                h-40
                text-zinc-500
                text-xs
              "
            >
              Memuat berita...
            </div>

          ) : newsList.length === 0 ? (

            <div
              className="
                text-center
                py-12
                text-zinc-500
                text-xs
              "
            >
              Tidak ada berita ditemukan.
            </div>

          ) : (

            newsList.map((news) => (

              <NewsCard
                key={news._id}
                news={news}
                selected={
                  selectedNews?._id === news._id
                }
                onSelect={() =>
                  onSelectNews(news)
                }
              />

            ))

          )}

        </div>

        {/* ========================================= */}
        {/* PAGINATION */}
        {/* ========================================= */}

        {pagination &&
          pagination.totalPage > 1 && (

          <div
            className="
              p-3
              border-t
              border-zinc-700
              flex
              items-center
              justify-between
              text-xs
              shrink-0
            "
          >

            <button
              onClick={onPreviousPage}
              disabled={
                !pagination.hasPrevPage ||
                loading
              }
              className="
                px-3
                py-2
                bg-zinc-900
                border
                border-zinc-700
                rounded-lg
                hover:bg-zinc-700
                disabled:opacity-30
                transition-colors
              "
            >
              Prev
            </button>

            <span className="text-zinc-400">
              <strong className="text-zinc-200">
                {currentPage}
              </strong>{" "}
              / {pagination.totalPage}
            </span>

            <button
              onClick={onNextPage}
              disabled={
                !pagination.hasNextPage ||
                loading
              }
              className="
                px-3
                py-2
                bg-zinc-900
                border
                border-zinc-700
                rounded-lg
                hover:bg-zinc-700
                disabled:opacity-30
                transition-colors
              "
            >
              Next
            </button>

          </div>

        )}

      </div>
    </aside>
  );
}