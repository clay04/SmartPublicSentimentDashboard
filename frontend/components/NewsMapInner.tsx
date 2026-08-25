"use client";

import { useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import { AIResultNews } from "@/types/news";
import { MapAction } from "@/types/chat";

import "leaflet/dist/leaflet.css";

const createCustomIcon = (
  urgency?: string
) => {
  let colorClass =
    "bg-indigo-500 shadow-indigo-500/50";

  if (
    urgency?.toLowerCase() === "high"
  ) {
    colorClass =
      "bg-red-500 shadow-red-500/50";
  }

  if (
    urgency?.toLowerCase() === "medium"
  ) {
    colorClass =
      "bg-amber-500 shadow-amber-500/50";
  }

  if (
    urgency?.toLowerCase() === "low"
  ) {
    colorClass =
      "bg-emerald-500 shadow-emerald-500/50";
  }

  return L.divIcon({
    className:
      "custom-leaflet-marker",

    html: `
      <div
        class="w-6 h-6 rounded-full border-2 border-white ${colorClass} shadow-lg animate-pulse"
      ></div>
    `,

    iconSize: [24, 24],

    iconAnchor: [12, 12],
  });
};

interface MapProps {
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

function BoundsHandler({
  onBoundsChange,
}: {
  onBoundsChange: (
    bounds: L.LatLngBounds
  ) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      console.log(
        "🗺️ MAP MOVEEND"
      );

      onBoundsChange(
        map.getBounds()
      );
    },
  });

  useEffect(() => {
    onBoundsChange(
      map.getBounds()
    );
  }, [
    map,
    onBoundsChange,
  ]);

  return null;
}

function MapFlyTo({
  selectedNews,
}: {
  selectedNews:
    AIResultNews | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (
      selectedNews &&
      selectedNews.latitude !== undefined &&
      selectedNews.longitude !== undefined
    ) {
      console.log(
        "📰 MAP FLY TO NEWS:",
        selectedNews.latitude,
        selectedNews.longitude
      );

      map.flyTo(
        [
          selectedNews.latitude,
          selectedNews.longitude,
        ],
        12,
        {
          duration: 1.5,
        }
      );
    }
  }, [
    selectedNews,
    map,
  ]);

  return null;
}

function MapNavigate({
  mapNavigation,
}: {
  mapNavigation: MapAction | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (
      !mapNavigation ||
      mapNavigation.type !== "navigate"
    ) {
      return;
    }

    const {
      latitude,
      longitude,
      zoom = 15,
    } = mapNavigation;

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      console.warn(
        "⚠️ Invalid map navigation:",
        mapNavigation
      );

      return;
    }

    console.log(
      "🤖🗺️ CHATBOT MAP NAVIGATION:",
      {
        latitude,
        longitude,
        zoom,
      }
    );

    map.flyTo(
      [
        latitude,
        longitude,
      ],
      zoom,
      {
        animate: true,
        duration: 1.5,
      }
    );
  }, [
    mapNavigation,
    map,
  ]);

  return null;
}

export default function NewsMapInner({
  newsList,
  selectedNews,
  onBoundsChange,
  onSelectNews,
  mapNavigation,
}: MapProps) {
  const defaultCenter: [
    number,
    number
  ] = [
    -2.548926,
    118.014863,
  ];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={5}
      className="w-full h-full z-0 rounded-2xl overflow-hidden"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <BoundsHandler
        onBoundsChange={
          onBoundsChange
        }
      />

      <MapFlyTo
        selectedNews={
          selectedNews
        }
      />

      <MapNavigate
        mapNavigation={
          mapNavigation
        }
      />

      {newsList.map(
        (item) => {
          if (
            item.latitude === undefined ||
            item.longitude === undefined
          ) {
            return null;
          }

          return (
            <Marker
              key={item._id}
              position={[
                item.latitude,
                item.longitude,
              ]}
              icon={createCustomIcon(
                item.urgency
              )}
              eventHandlers={{
                click: () =>
                  onSelectNews(
                    item
                  ),
              }}
            >
              <Popup
                className="text-slate-900"
              >
                <div className="p-1">
                  <span className="text-xs font-semibold uppercase text-indigo-600 block mb-1">
                    {
                      item.category ||
                      "Berita"
                    }
                  </span>

                  <h4 className="font-bold text-sm leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1">
                    {item.location}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        }
      )}
    </MapContainer>
  );
}