"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { chatApi } from "@/services/api";
import {
  ChatMessage,
  MapAction,
} from "@/types/chat";

interface ChatContextValue {
  conversationId: number | null;

  messages: ChatMessage[];

  loading: boolean;

  error: string | null;

  mapAction: MapAction | null;

  sendMessage: (text: string) => Promise<void>;

  clearMapAction: () => void;

  clearChat: () => void;
}

const ChatContext =
  createContext<ChatContextValue | undefined>(
    undefined
  );

interface ChatProviderProps {
  children: ReactNode;

  conversationId: number | null;

  onMapNavigate: (action: MapAction) => void;
}

export function ChatProvider({
  children,
  conversationId,
  onMapNavigate,
}: ChatProviderProps) {

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [mapAction, setMapAction] =
    useState<MapAction | null>(null);

  useEffect(() => {
    setMessages([]);
    setError(null);
    setMapAction(null);
  }, [conversationId]);

  const sendMessage = useCallback(
    async (text: string) => {

      const trimmedText = text.trim();

      if (
        !trimmedText ||
        !conversationId ||
        loading
      ) {
        return;
      }

      setLoading(true);
      setError(null);

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: trimmedText,
        },
      ]);

      try {

        console.log(
          "📤 CHAT REQUEST:",
          {
            conversationId,
            text: trimmedText,
          }
        );

        const response =
          await chatApi.sendMessage(
            conversationId,
            trimmedText
          );

        console.log(
          "📥 CHAT RESPONSE:",
          response
        );

        if (
          response.status !== "success"
        ) {
          throw new Error(
            response.answer ||
              "Chat gagal diproses."
          );
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: response.answer,
          },
        ]);

        if (
          response.map_action &&
          response.map_action.type ===
            "navigate"
        ) {

          console.log(
            "🗺️ MAP ACTION RECEIVED:",
            response.map_action
          );

          setMapAction(
            response.map_action
          );

          onMapNavigate(
            response.map_action
          );
        }

      } catch (err) {

        console.error(
          "❌ CHAT ERROR:",
          err
        );

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menghubungi chatbot.";

        setError(errorMessage);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: errorMessage,
          },
        ]);

      } finally {

        setLoading(false);
      }
    },
    [
      conversationId,
      loading,
      onMapNavigate,
    ]
  );

  const clearMapAction =
    useCallback(() => {
      setMapAction(null);
    }, []);

  const clearChat =
    useCallback(() => {
      setMessages([]);
      setError(null);
      setMapAction(null);
    }, []);

  return (
    <ChatContext.Provider
      value={{
        conversationId,

        messages,

        loading,

        error,

        mapAction,

        sendMessage,

        clearMapAction,

        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {

  const context =
    useContext(ChatContext);

  if (!context) {
    throw new Error(
      "useChat harus digunakan di dalam ChatProvider"
    );
  }

  return context;
}