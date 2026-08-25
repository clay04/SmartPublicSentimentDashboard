"use client";

import { useEffect, useState } from "react";

import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useChat } from "@/context/ChatContext";

export default function NewsChatbot() {

  const {
    conversationId,
    messages,
    loading,
    error,
    sendMessage,
  } = useChat();

  const [message, setMessage] =
    useState("");

  const [speaking, setSpeaking] =
    useState(false);

  const lastAssistantMessage =
    [...messages]
      .reverse()
      .find(
        (msg) =>
          msg.role === "assistant"
      );

  useEffect(() => {

    if (
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    const handleEnd = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.addEventListener(
      "end",
      handleEnd
    );

    return () => {

      window.speechSynthesis.removeEventListener(
        "end",
        handleEnd
      );

    };

  }, []);

  const handleSpeak = () => {

    if (
      !lastAssistantMessage?.text ||
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    if (speaking) {

      window.speechSynthesis.cancel();

      setSpeaking(false);

      return;
    }

    const cleanText =
      lastAssistantMessage.text
        .replace(
          /[*_#`]/g,
          ""
        )
        .replace(
          /\|/g,
          " "
        )
        .replace(
          /-{3,}/g,
          " "
        );

    const utterance =
      new SpeechSynthesisUtterance(
        cleanText
      );

    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const voices =
      window.speechSynthesis.getVoices();

    const indonesianVoice =
      voices.find(
        (voice) =>
          voice.lang
            .toLowerCase()
            .startsWith("id")
      );

    if (indonesianVoice) {
      utterance.voice =
        indonesianVoice;
    }

    utterance.onstart = () => {
      setSpeaking(true);
    };

    utterance.onend = () => {
      setSpeaking(false);
    };

    utterance.onerror = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.speak(
      utterance
    );
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    const text =
      message.trim();

    if (
      !text ||
      !conversationId ||
      loading
    ) {
      return;
    }

    console.log(
      "🤖 CHAT QUESTION:",
      text
    );

    setMessage("");

    if (
      typeof window !== "undefined" &&
      window.speechSynthesis
    ) {

      window.speechSynthesis.cancel();

      setSpeaking(false);
    }

    await sendMessage(text);
  };

  return (

    <div className="h-40 shrink-0 border-t border-zinc-700/80 bg-zinc-900/95 backdrop-blur-xl p-3">

      <div className="h-full flex flex-col">

        <div className="flex items-center gap-2 px-1 mb-2 shrink-0">

          <div className="w-6 h-6 rounded-md bg-indigo-500/15 flex items-center justify-center">

            <Bot className="w-4 h-4 text-indigo-400" />

          </div>

          <span className="text-xs font-semibold text-zinc-300">
            AI News Assistant
          </span>

          <Sparkles className="w-3 h-3 text-indigo-400" />

        </div>

        <div className="flex-1 min-h-0 mb-2">

          {loading && (
            <div className="flex items-center gap-2 px-1 text-xs text-zinc-500">

              <Loader2 className="w-3 h-3 animate-spin" />

              <span>
                AI sedang menganalisis berita...
              </span>

            </div>
          )}

          {!loading &&
            lastAssistantMessage && (

              <div className="h-full flex items-start gap-2">

                {/* ANSWER */}

                <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1 rounded-lg bg-zinc-800/60 border border-zinc-800">

                  <p className="text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap">

                    {lastAssistantMessage.text}

                  </p>

                </div>


                {/* TTS BUTTON */}

                <button
                  type="button"
                  onClick={
                    handleSpeak
                  }
                  title={
                    speaking
                      ? "Berhenti membaca"
                      : "Bacakan jawaban"
                  }
                  className="shrink-0 w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center transition-colors"
                >

                  {speaking ? (

                    <VolumeX className="w-4 h-4 text-red-400" />

                  ) : (

                    <Volume2 className="w-4 h-4 text-indigo-400" />

                  )}

                </button>

              </div>

            )}

          {!loading &&
            !lastAssistantMessage &&
            !error && (

              <div className="px-1 text-[11px] text-zinc-500">

                Tanyakan sesuatu tentang berita,
                lokasi, atau kejadian.

              </div>

            )}

          {error && (

            <div className="px-2 py-1 text-[11px] text-red-400">

              {error}

            </div>

          )}

        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 shrink-0"
        >

          <input
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            disabled={
              loading ||
              !conversationId
            }
            placeholder={
              !conversationId
                ? "Menyiapkan percakapan..."
                : "Tanyakan berita, lokasi, atau kejadian..."
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={
              loading ||
              !conversationId ||
              !message.trim()
            }
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 flex items-center justify-center transition-colors"
          >

            {loading ? (

              <Loader2
                className="w-4 h-4 text-white animate-spin"
              />

            ) : (

              <Send
                className="w-4 h-4 text-white"
              />

            )}

          </button>

        </form>

      </div>

    </div>
  );
}