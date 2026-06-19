"use client";

import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useRouter } from "next/navigation";
import AskAiDrawer from "./AskAiDrawer";

import {
  getAnalysisRun,
  getArtifactText,
  getArtifactUrl,
  type RunDetails,
} from "@/lib/tubeintel-api";

type StoredRunReference = {
  run_id: string;
};

export default function RunDetailsScreen() {
  const router = useRouter();

  const [run, setRun] = useState<RunDetails | null>(null);
  const [transcriptText, setTranscriptText] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedRun = localStorage.getItem(
      "tubeintel_latest_run",
    );

    if (!storedRun) {
      router.replace("/summarize");
      return;
    }

    let runId: string;

    try {
      const parsedRun = JSON.parse(
        storedRun,
      ) as StoredRunReference;

      if (
        !parsedRun.run_id ||
        typeof parsedRun.run_id !== "string"
      ) {
        throw new Error("Missing run ID.");
      }

      runId = parsedRun.run_id;
    } catch {
      localStorage.removeItem("tubeintel_latest_run");
      router.replace("/summarize");
      return;
    }

    let cancelled = false;

    async function loadRun() {
      try {
        setIsLoading(true);
        setError("");

        const runDetails = await getAnalysisRun(runId);

        if (cancelled) {
          return;
        }

        if (runDetails.status === "failed") {
          setError(
            runDetails.error ||
            "The analysis run failed.",
          );
          return;
        }

        if (runDetails.status !== "completed") {
          localStorage.setItem(
            "tubeintel_active_run",
            JSON.stringify({
              run_id: runDetails.run_id,
              youtube_url: runDetails.youtube_url,
              output_formats: [
                "transcript",
                "summary",
                "pdf",
              ],
            }),
          );

          router.replace("/workflow");
          return;
        }

        const [fullTranscript, fullSummary] =
          await Promise.all([
            getArtifactText(
              runDetails.transcript_file,
            ),
            getArtifactText(
              runDetails.summary_file,
            ),
          ]);

        if (cancelled) {
          return;
        }

        setRun(runDetails);

        setTranscriptText(
          fullTranscript ||
          runDetails.transcript_preview ||
          "No transcript is available.",
        );

        setSummaryText(
          fullSummary ||
          runDetails.summary_preview ||
          "No summary is available.",
        );
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load the run details.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRun();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#131317] text-[#ccc3d8]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-[#d2bbff]">
            progress_activity
          </span>

          Loading complete run details...
        </div>
      </main>

    );
  }

  if (error || !run) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#131317] px-6 text-[#e4e1e7]">
        <section className="w-full max-w-lg rounded-xl border border-red-400/30 bg-[#1b1b1f] p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-red-400">
            error
          </span>

          <h1 className="mt-4 text-2xl font-semibold">
            Could not load this run
          </h1>

          <p className="mt-3 text-sm text-[#ccc3d8]">
            {error || "Run details were not found."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.replace("/summarize")
            }
            className="mt-6 rounded-xl bg-[#7c3aed] px-6 py-3 font-medium text-white"
          >
            Return to summarizer
          </button>
        </section>
      </main>
    );
  }

  const transcriptUrl = getArtifactUrl(
    run.transcript_file,
  );

  const summaryUrl = getArtifactUrl(
    run.summary_file,
  );

  const pdfUrl = getArtifactUrl(run.pdf_file);

  return (
    <div className="min-h-screen bg-[#131317] text-[#e4e1e7]">
      <main
        className={
          isChatOpen
            ? "min-h-screen xl:mr-[480px]"
            : "min-h-screen"
        }
      >
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#4a4455] bg-[#131317]/80 px-6 backdrop-blur-md">
          <button
            type="button"
            onClick={() =>
              router.push("/summarize")
            }
            className="flex items-center gap-2 text-[#ccc3d8] hover:text-[#d2bbff]"
          >
            <span className="material-symbols-outlined">
              arrow_back
            </span>

            New analysis
          </button>

          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[#7c3aed] px-5 py-2.5 text-sm font-medium text-white"
          >
            <span className="material-symbols-outlined text-[18px]">
              auto_awesome
            </span>

            Ask AI
          </button>
        </header>

        <div className="mx-auto max-w-[1400px] space-y-8 p-8">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="overflow-hidden rounded-xl border border-[#4a4455] bg-[#1f1f23] lg:col-span-8">
              <div className="relative aspect-video">
                {run.thumbnail_url ? (
                  <img
                    src={run.thumbnail_url}
                    alt="YouTube video thumbnail"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#1b1b1f]">
                    <span className="material-symbols-outlined text-7xl text-[#4a4455]">
                      smart_display
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#131317] to-transparent opacity-80" />

                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-3xl font-semibold">
                    {run.video_title || "YouTube Video Analysis"}
                  </h1>

                  {run.channel_name && (
                    <p className="mt-1 text-sm text-[#ccc3d8]">
                      {run.channel_name}
                    </p>
                  )}

                  <a
                    href={run.youtube_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block truncate text-sm text-[#d2bbff]"
                  >
                    {run.youtube_url}
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#4a4455] bg-[#1b1b1f] p-6 lg:col-span-4">
              <MetadataRow
                label="Status"
                value="COMPLETED"
              />

              <MetadataRow
                label="Run ID"
                value={run.run_id}
              />

              <MetadataRow
                label="Title"
                value={run.video_title || "Unknown"}
              />

              <MetadataRow
                label="Summary style"
                value={run.summary_style}
              />

              <MetadataRow
                label="Language"
                value={
                  run.language ||
                  run.language_code ||
                  "Unknown"
                }
              />

              <MetadataRow
                label="Transcript segments"
                value={String(run.segment_count ?? 0)}
              />

              <MetadataRow
                label="AI chunks"
                value={String(run.chunk_count ?? 0)}
              />

              <MetadataRow
                label="Vector chunks"
                value={String(run.vector_chunk_count ?? 0)}
              />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PreviewPanel
              title="Complete Transcript"
              content={transcriptText}
              monospace
            />

            <PreviewPanel
              title="Complete AI Report"
              content={summaryText}
              markdown
            />
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Export Artifacts
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {transcriptUrl && (
                <DownloadCard
                  title="transcript.md"
                  description="Complete timestamped transcript"
                  icon="description"
                  href={transcriptUrl}
                />
              )}

              {summaryUrl && (
                <DownloadCard
                  title="summary.md"
                  description="Complete Markdown analysis"
                  icon="article"
                  href={summaryUrl}
                />
              )}

              {pdfUrl && (
                <DownloadCard
                  title="summary.pdf"
                  description="Formatted PDF report"
                  icon="picture_as_pdf"
                  href={pdfUrl}
                />
              )}
            </div>
          </section>
        </div>
      </main>

      <AskAiDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        runId={run.run_id}
      />
    </div>
  );
}

function MetadataRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#4a4455]/30 py-3">
      <span className="shrink-0 text-sm text-[#ccc3d8]">
        {label}
      </span>

      <span className="max-w-[220px] truncate text-right font-mono text-xs">
        {value}
      </span>
    </div>
  );
}

function PreviewPanel({
  title,
  content,
  monospace = false,
  markdown = false,
}: {
  title: string;
  content: string;
  monospace?: boolean;
  markdown?: boolean;
}) {
  const html = useMemo(() => {
    if (!markdown) {
      return "";
    }

    const parsedMarkdown = marked.parse(
      content,
    ) as string;

    return DOMPurify.sanitize(parsedMarkdown);
  }, [content, markdown]);

  return (
    <div className="flex h-[520px] flex-col overflow-hidden rounded-xl border border-[#4a4455] bg-[#1f1f23]">
      <div className="border-b border-[#4a4455] bg-[#353439] px-6 py-3">
        <h2 className="font-medium">{title}</h2>
      </div>

      <div
        className={[
          "flex-1 overflow-y-auto bg-[#1b1b1f] p-6 text-[#ccc3d8]",
          monospace
            ? "whitespace-pre-wrap font-mono text-xs leading-6"
            : "",
        ].join(" ")}
      >
        {markdown ? (
          <div
            className="chat-markdown"
            dangerouslySetInnerHTML={{
              __html: html,
            }}
          />
        ) : (
          content
        )}
      </div>
    </div>
  );
}

function DownloadCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-4 rounded-xl border border-[#4a4455] bg-[#1f1f23] p-4 transition-colors hover:bg-[#2a292e]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#353439] text-[#d2bbff]">
        <span className="material-symbols-outlined text-[32px]">
          {icon}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {title}
        </p>

        <p className="text-xs text-[#ccc3d8]">
          {description}
        </p>
      </div>

      <span className="material-symbols-outlined text-[#ccc3d8]">
        download
      </span>
    </a>
  );
}