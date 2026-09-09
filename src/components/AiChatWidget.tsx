import { useState } from "react";
import api from "../api/client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (question.trim() === "") return;

    const userMessage: ChatMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", { question });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.data.answer }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong answering that." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-3 text-sm font-medium shadow-lg shadow-indigo-300 transition"
      >
        Ask about your team
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-indigo-600 text-white">
        <span className="text-sm font-medium">Team assistant</span>
        <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-sm">
          ✕
        </button>
      </div>

      <div className="flex-1 max-h-80 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-slate-400">
            Ask things like "What did the team work on last week?" or "What are the recurring blockers?"
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm rounded-lg px-3 py-2 max-w-[90%] ${
              m.role === "user"
                ? "bg-indigo-50 text-indigo-900 ml-auto"
                : "bg-slate-100 text-slate-800"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && <p className="text-xs text-slate-400">Thinking...</p>}
      </div>

      <div className="flex items-center gap-2 p-3 border-t border-slate-100">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ask a question..."
          className="flex-1 border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded-lg disabled:opacity-50"
        >
          Ask
        </button>
      </div>
    </div>
  );
}