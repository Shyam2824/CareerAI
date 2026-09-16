"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Bot,
  Loader2,
  MessageCircle,
  Send,
  Trash2,
  User,
  Sparkles,
} from "lucide-react";

import { useRouter } from "next/navigation";

import  api  from "@/services/api";


interface ChatMessage {
  id: number;
  user_id: number;
  role: "user" | "assistant";
  message: string;
  created_at: string;
}


const suggestions = [
  "What skills should I learn next?",
  "Am I ready for my target role?",
  "How can I improve my resume?",
  "What should I focus on for my career?",
  "How should I prepare for interviews?",
];


export default function CareerChatPage() {
  const router = useRouter();

  const [messages, setMessages] = useState<
    ChatMessage[]
  >([]);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const [clearing, setClearing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(
    null
  );


  // ==========================================================
  // LOAD HISTORY
  // ==========================================================

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchHistory();
  }, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);


  const fetchHistory = async () => {
    try {
      const response = await api.get<
        ChatMessage[]
      >("/career-chat/history");

      setMessages(response.data);
    } catch (error) {
      console.error(
        "Failed to load career chat:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  const sendMessage = async (
    event?: FormEvent
  ) => {
    event?.preventDefault();

    const message = input.trim();

    if (!message || sending) {
      return;
    }

    setSending(true);
    setInput("");

    try {
      const response = await api.post<
        ChatMessage[]
      >(
        "/career-chat",
        {
          message,
        }
      );

      setMessages((previous) => [
        ...previous,
        ...response.data,
      ]);
    } catch (error) {
      console.error(
        "Career chat error:",
        error
      );

      setInput(message);
    } finally {
      setSending(false);
    }
  };


  // ==========================================================
  // CLEAR CHAT
  // ==========================================================

  const clearChat = async () => {
    if (
      clearing ||
      messages.length === 0
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear your career chat history?"
    );

    if (!confirmed) {
      return;
    }

    setClearing(true);

    try {
      await api.delete(
        "/career-chat/history"
      );

      setMessages([]);
    } catch (error) {
      console.error(
        "Failed to clear chat:",
        error
      );
    } finally {
      setClearing(false);
    }
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />

          <p className="text-sm text-slate-400">
            Loading AI Career Chat...
          </p>
        </div>
      </main>
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard/career-intelligence/career-chat")
              }
              className="rounded-xl border border-slate-800 bg-slate-900 p-2 transition hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>


            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-indigo-600/20 p-3">
                <Sparkles className="h-6 w-6 text-indigo-400" />
              </div>

              <div>
                <h1 className="text-xl font-bold sm:text-2xl">
                  AI Career Chat
                </h1>

                <p className="text-sm text-slate-400">
                  Your personalized career assistant
                </p>
              </div>

            </div>

          </div>


          <button
            type="button"
            onClick={clearChat}
            disabled={
              clearing ||
              messages.length === 0
            }
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {clearing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}

            <span className="hidden sm:inline">
              Clear
            </span>
          </button>

        </div>


        {/* ==================================================
            CHAT CONTAINER
        ================================================== */}

        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          {/* ==================================================
              WELCOME
          ================================================== */}

          {messages.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">

              <div className="mb-5 rounded-2xl bg-indigo-600/20 p-5">
                <MessageCircle className="h-10 w-10 text-indigo-400" />
              </div>

              <h2 className="text-2xl font-bold">
                How can I help with your career?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Ask me about your skills, resume,
                career path, learning roadmap,
                job applications, or interview
                preparation.
              </p>


              <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">

                {suggestions.map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        setInput(
                          suggestion
                        )
                      }
                      className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-left text-sm text-slate-300 transition hover:border-indigo-500/50 hover:bg-indigo-500/5"
                    >
                      {suggestion}
                    </button>
                  )
                )}

              </div>

            </div>
          )}


          {/* ==================================================
              MESSAGES
          ================================================== */}

          {messages.length > 0 && (
            <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">

              {messages.map(
                (message) => {

                  const isUser =
                    message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      {!isUser && (
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600/20">
                          <Bot className="h-5 w-5 text-indigo-400" />
                        </div>
                      )}


                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${
                          isUser
                            ? "bg-indigo-600 text-white"
                            : "border border-slate-800 bg-slate-950 text-slate-200"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">
                          {message.message}
                        </p>
                      </div>


                      {isUser && (
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800">
                          <User className="h-5 w-5 text-slate-300" />
                        </div>
                      )}

                    </div>
                  );
                }
              )}

              <div ref={messagesEndRef} />

            </div>
          )}


          {/* ==================================================
              INPUT
          ================================================== */}

          <div className="border-t border-slate-800 bg-slate-950 p-4">

            <form
              onSubmit={sendMessage}
              className="flex items-end gap-3"
            >

              <textarea
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {

                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();

                    sendMessage();
                  }

                }}
                placeholder="Ask anything about your career..."
                rows={2}
                maxLength={4000}
                disabled={sending}
                className="min-h-13 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 disabled:opacity-50"
              />


              <button
                type="submit"
                disabled={
                  sending ||
                  !input.trim()
                }
                className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-indigo-600 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
              >

                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}

              </button>

            </form>


            <p className="mt-2 text-center text-xs text-slate-600">
              CareerAI uses your Career Profile,
              Skill Gap and Learning Roadmap to
              personalize responses.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}