"use client";

import {
  useState,
  type ComponentProps,
} from "react";

import {
  askRunQuestion,
  type ChatSource,
} from "@/lib/tubeintel-api";

type FormSubmitHandler = NonNullable<
  ComponentProps<"form">["onSubmit"]
>;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
};

type AskAiDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  runId: string;
};

export default function AskAiDrawer({
  isOpen,
  onClose,
  runId,
}: AskAiDrawerProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask a question about this video. Answers will be grounded only in the transcript.",
    },
  ]);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const handleSubmit: FormSubmitHandler = async (
    event,
  ) => {
    event.preventDefault();

    const cleanedQuestion = question.trim();

    if (!cleanedQuestion || isSubmitting) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: cleanedQuestion,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setQuestion("");
    setError("");
    setIsSubmitting(true);

    try {
      const response = await askRunQuestion(
        runId,
        cleanedQuestion,
      );

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        sources: response.sources,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The question could not be answered.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col border-l border-[#4a4455] bg-[#17171b] shadow-2xl">
      <header className="flex h-16 items-center justify-between border-b border-[#4a4455] px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7c3aed]/20 text-[#d2bbff]">
            <span className="material-symbols-outlined">
              auto_awesome
            </span>
          </div>

          <div>
            <h2 className="font-semibold text-[#e4e1e7]">
              Ask AI
            </h2>

            <p className="text-xs text-[#958da1]">
              Grounded in the transcript
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Ask AI"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#ccc3d8] hover:bg-[#353439]"
        >
          <span className="material-symbols-outlined">
            close
          </span>
        </button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {messages.map((message) => (
          <ChatMessageCard
            key={message.id}
            message={message}
          />
        ))}

        {isSubmitting && (
          <div className="flex items-center gap-3 text-sm text-[#958da1]">
            <span className="material-symbols-outlined animate-spin text-[#d2bbff]">
              progress_activity
            </span>

            Searching the transcript...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-[#4a4455] p-4"
      >
        <div className="rounded-xl border border-[#4a4455] bg-[#1f1f23] p-3 focus-within:border-[#d2bbff]">
          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            placeholder="Ask something about the video..."
            rows={3}
            maxLength={1000}
            disabled={isSubmitting}
            className="w-full resize-none bg-transparent text-sm text-[#e4e1e7] outline-none placeholder:text-[#6f6878]"
          />

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-[#6f6878]">
              {question.length}/1000
            </span>

            <button
              type="submit"
              disabled={
                !question.trim() ||
                isSubmitting
              }
              className="flex items-center gap-2 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                send
              </span>

              Ask
            </button>
          </div>
        </div>
      </form>
    </aside>
  );
}

function ChatMessageCard({
  message,
}: {
  message: ChatMessage;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={[
        "flex",
        isUser
          ? "justify-end"
          : "justify-start",
      ].join(" ")}
    >
      <div
        className={[
          "max-w-[90%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-[#7c3aed] text-white"
            : "border border-[#4a4455] bg-[#1f1f23] text-[#e4e1e7]",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap text-sm leading-6">
          {message.content}
        </p>

        {!isUser &&
          message.sources &&
          message.sources.length > 0 && (
            <details className="mt-4 border-t border-[#4a4455]/50 pt-3">
              <summary className="cursor-pointer text-xs font-medium text-[#d2bbff]">
                View transcript sources (
                {message.sources.length})
              </summary>

              <div className="mt-3 space-y-3">
                {message.sources.map(
                  (source) => (
                    <div
                      key={source.chunk_id}
                      className="rounded-lg bg-[#17171b] p-3"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="font-mono text-xs text-[#d2bbff]">
                          Chunk {source.chunk_id}
                        </span>

                        {source.relevance_score !==
                          null && (
                          <span className="text-xs text-[#958da1]">
                            Score:{" "}
                            {source.relevance_score.toFixed(
                              2,
                            )}
                          </span>
                        )}
                      </div>

                      <p className="line-clamp-5 text-xs leading-5 text-[#ccc3d8]">
                        {source.text}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </details>
          )}
      </div>
    </div>
  );
}