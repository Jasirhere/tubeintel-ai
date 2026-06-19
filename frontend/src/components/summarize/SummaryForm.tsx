"use client";

import { useMemo, useState, type ComponentProps } from "react";
import { useRouter } from "next/navigation";

import { type OutputFormat } from "@/lib/api";
import {
  createAnalysisRun,
  type SummaryStyle,
} from "@/lib/tubeintel-api";

type FormSubmitHandler = NonNullable<
  ComponentProps<"form">["onSubmit"]
>;

function isValidVideoId(value: string | null): value is string {
  return (
    value !== null &&
    /^[A-Za-z0-9_-]{11}$/.test(value)
  );
}

function extractVideoId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase();

    let candidate: string | null = null;

    if (hostname === "youtu.be") {
      candidate =
        url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com")
    ) {
      if (url.pathname === "/watch") {
        candidate = url.searchParams.get("v");
      } else {
        const parts = url.pathname.split("/").filter(Boolean);

        if (
          parts.length >= 2 &&
          ["shorts", "embed", "live"].includes(parts[0])
        ) {
          candidate = parts[1];
        }
      }
    }

    return isValidVideoId(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

const summaryStyles: SummaryStyle[] = [
  "Professional",
  "Academic",
  "Executive Brief",
  "Bullet Notes",
];

const outputChoices: {
  value: OutputFormat;
  label: string;
}[] = [
    { value: "transcript", label: "Transcript" },
    { value: "summary", label: "Markdown Summary" },
    { value: "pdf", label: "PDF Report" },
  ];

export default function SummaryForm() {
  const router = useRouter();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [summaryStyle, setSummaryStyle] =
    useState<SummaryStyle>("Bullet Notes");
  const [outputFormats, setOutputFormats] = useState<OutputFormat[]>([
    "transcript",
    "summary",
    "pdf",
  ]);
  const [optionalNotes, setOptionalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const videoId = useMemo(
    () => extractVideoId(youtubeUrl),
    [youtubeUrl],
  );

  const isValidYouTubeUrl = videoId !== null;

  function toggleOutput(format: OutputFormat) {
    setOutputFormats((current) =>
      current.includes(format)
        ? current.filter((item) => item !== format)
        : [...current, format],
    );
  }

  const handleSubmit: FormSubmitHandler = async (
    event,
  ) => {
    event.preventDefault();
    setError("");

    if (!isValidYouTubeUrl) {
      setError("Enter a valid YouTube URL.");
      return;
    }

    if (outputFormats.length === 0) {
      setError("Select at least one output format.");
      return;
    }

    try {
      setIsSubmitting(true);

      const run = await createAnalysisRun({
        youtube_url: youtubeUrl.trim(),
        preferred_languages: ["en"],
        summary_style: summaryStyle,
        optional_notes: optionalNotes.trim(),
      });

      localStorage.setItem(
        "tubeintel_active_run",
        JSON.stringify({
          run_id: run.run_id,
          youtube_url: youtubeUrl.trim(),
          output_formats: outputFormats,
        }),
      );

      router.push("/workflow");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while starting the analysis.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-xl border border-[#2d2d3d] bg-[rgba(26,26,36,0.8)] p-8 shadow-xl backdrop-blur-xl"
    >
      <div className="space-y-3">
        <label htmlFor="video-url" className="block text-sm font-medium text-[#ccc3d8]">
          YouTube Video URL
        </label>

        <div className="relative">
          <input
            id="video-url"
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            className="font-mono-custom w-full rounded-lg border border-[#4a4455] bg-[#1f1f23] px-4 py-3.5 pr-40 text-xs outline-none transition-all focus:border-[#d2bbff] focus:ring-1 focus:ring-[#d2bbff]"
            placeholder="Paste video link here..."
            type="url"
          />

          {isValidYouTubeUrl && (
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-md border border-green-500/20 bg-green-500/10 px-3 py-1 text-green-400">
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span className="text-xs font-medium">Video accepted</span>
            </div>
          )}
        </div>

        {videoId && (
          <div className="mt-4 rounded-lg border border-[#4a4455]/30 bg-[#1b1b1f] p-4">
            <div className="text-sm font-semibold text-[#e4e1e7]">
              YouTube video ready for analysis
            </div>
            <div className="mt-2 text-xs text-[#958da1]">
              Video ID: {videoId}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <label htmlFor="summary-style" className="block text-sm font-medium text-[#ccc3d8]">
            Summary Style
          </label>

          <div className="relative">
            <select
              id="summary-style"
              value={summaryStyle}
              onChange={(event) =>
                setSummaryStyle(
                  event.target.value as SummaryStyle,
                )
              }
              className="w-full appearance-none rounded-lg border border-[#4a4455] bg-[#1f1f23] px-4 py-3.5 text-sm outline-none transition-all focus:border-[#d2bbff]"
            >
              {summaryStyles.map((style) => (
                <option key={style}>{style}</option>
              ))}
            </select>

            <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#958da1]">
              expand_more
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-[#ccc3d8]">Output Format</p>

          <div className="grid grid-cols-1 gap-3">
            {outputChoices.map((choice) => (
              <label
                key={choice.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#4a4455] bg-[#1b1b1f] p-3 transition-colors hover:border-[#d2bbff]/50"
              >
                <input
                  checked={outputFormats.includes(choice.value)}
                  onChange={() => toggleOutput(choice.value)}
                  className="h-5 w-5 rounded border-[#4a4455] bg-[#131317] text-[#7c3aed] focus:ring-[#d2bbff]"
                  type="checkbox"
                />
                <span className="text-sm text-[#e4e1e7]">{choice.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label htmlFor="optional-notes" className="block text-sm font-medium text-[#ccc3d8]">
          Optional notes
        </label>

        <textarea
          id="optional-notes"
          value={optionalNotes}
          onChange={(event) => setOptionalNotes(event.target.value)}
          className="w-full resize-none rounded-lg border border-[#4a4455] bg-[#1f1f23] px-4 py-3.5 text-sm outline-none transition-all focus:border-[#d2bbff]"
          placeholder="Any specific focus? (e.g. 'Focus only on the technical implementation details')"
          rows={4}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#4a4455]/30 pt-6">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[
              ["translate", "#d2bbff"],
              ["summarize", "#cebdff"],
              ["search", "#c6c4d9"],
            ].map(([icon, colour]) => (
              <div
                key={icon}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#131317] bg-[#7c3aed]/20"
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ color: colour }}
                >
                  {icon}
                </span>
              </div>
            ))}
          </div>
          <span className="text-xs text-[#958da1]">AI Pipeline Ready</span>
        </div>

        <button
          disabled={isSubmitting}
          className="flex items-center gap-3 rounded-xl bg-[#7c3aed] px-8 py-4 text-xl font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.25)] hover:shadow-[0_0_30px_rgba(124,58,237,0.45)] disabled:cursor-wait disabled:opacity-80"
          type="submit"
        >
          <span className={`material-symbols-outlined ${isSubmitting ? "animate-spin" : ""}`}>
            {isSubmitting ? "progress_activity" : "bolt"}
          </span>
          {isSubmitting ? "Starting Analysis..." : "Run AI Analysis"}
        </button>
      </div>
    </form>
  );
}
