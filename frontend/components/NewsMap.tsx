"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import { AIResultNews } from "@/types/news";
import { MapAction } from "@/types/chat";

import L from "leaflet";


interface NewsMapWrapperProps {

  newsList: AIResultNews[];

  selectedNews: AIResultNews | null;

  onBoundsChange: (
    bounds: L.LatLngBounds
  ) => void;

  onSelectNews: (
    news: AIResultNews
  ) => void;

  mapNavigation: MapAction | null;
}


const NewsMapInner = dynamic(
  () => import("./NewsMapInner"),
  {
    ssr: false,

    loading: () => (

      <div className="w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 gap-2 border border-slate-700">

        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />

        <span>
          Memuat Peta Interaktif...
        </span>

      </div>

    ),
  }
);


export default function NewsMap(
  props: NewsMapWrapperProps
) {

  return (
    <NewsMapInner
      {...props}
    />
  );

}