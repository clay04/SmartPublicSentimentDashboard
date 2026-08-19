"use client";

import { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
} from "lucide-react";

export default function NewsChatbot() {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    console.log("🤖 Chat message:", message);

    setMessage("");
  };

  return (
    <div className="h-24 shrink-0 border-t border-zinc-700/80 bg-zinc-900/95 backdrop-blur-xl p-3">

      <div className="h-full flex flex-col justify-center">

        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="w-6 h-6 rounded-md bg-indigo-500/15 flex items-center justify-center">
            <Bot className="w-4 h-4 text-indigo-400" />
          </div>

          <span className="text-xs font-semibold text-zinc-300">
            AI News Assistant
          </span>

          <Sparkles className="w-3 h-3 text-indigo-400" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2"
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tanyakan berita, lokasi, atau kejadian..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>

      </div>
    </div>
  );
}