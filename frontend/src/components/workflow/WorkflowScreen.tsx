"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { type OutputFormat } from "@/lib/api";
import {
  getAnalysisRun,
  type RunDetails,
  type RunStatus,
} from "@/lib/tubeintel-api";

type ActiveRun = {
  run_id: string;
  youtube_url: string;
  output_formats: OutputFormat[];
};

const statusLabels: Record<RunStatus, string> = {
  queued: "Waiting to start",
  extracting_transcript: "Extracting transcript",
  transcript_ready: "Transcript ready",
  indexing_transcript: "Building searchable transcript index",
  rag_ready: "Searchable transcript index ready",
  summarizing_chunks: "Analysing transcript sections",
  composing_report: "Composing final report",
  summary_ready: "Summary ready",
  generating_pdf: "Generating PDF report",
  completed: "Analysis completed",
  failed: "Analysis failed",
};

export default function WorkflowScreen() {
  const router = useRouter();

  const [run, setRun] = useState<RunDetails | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedRun = localStorage.getItem(
      "tubeintel_active_run",
    );

    if (!storedRun) {
      router.replace("/summarize");
      return;
    }

    let activeRun: ActiveRun;

    try {
      activeRun = JSON.parse(storedRun) as ActiveRun;
    } catch {
      localStorage.removeItem("tubeintel_active_run");
      router.replace("/summarize");
      return;
    }

    if (!activeRun.run_id) {
      router.replace("/summarize");
      return;
    }

    let cancelled = false;
    let pollTimer: number | undefined;

    async function pollRun() {
      try {
        const runDetails = await getAnalysisRun(
          activeRun.run_id,
        );

        if (cancelled) {
          return;
        }

        setRun(runDetails);
        setError("");

        if (runDetails.status === "completed") {
          const compatibleRunDetails = {
            run_id: runDetails.run_id,
            status: runDetails.status,
            youtube_url: runDetails.youtube_url,

            transcript_file:
              runDetails.transcript_file,
            summary_file:
              runDetails.summary_file,
            pdf_file:
              runDetails.pdf_file,

            summary_text:
              runDetails.summary_preview,
            transcript_preview:
              runDetails.transcript_preview,

            video_title: null,
            thumbnail_url:
              runDetails.thumbnail_url,

            output_formats:
              activeRun.output_formats,
          };

          localStorage.setItem(
            "tubeintel_latest_run",
            JSON.stringify(compatibleRunDetails),
          );

          localStorage.removeItem(
            "tubeintel_active_run",
          );

          router.replace("/run-details");
          return;
        }

        if (runDetails.status === "failed") {
          setError(
            runDetails.error ||
              "The analysis failed.",
          );
          return;
        }

        pollTimer = window.setTimeout(
          () => void pollRun(),
          1200,
        );
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not retrieve the run status.",
        );
      }
    }

    void pollRun();

    return () => {
      cancelled = true;

      if (pollTimer !== undefined) {
        window.clearTimeout(pollTimer);
      }
    };
  }, [router]);

  const progress = run?.progress ?? 0;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#131317] px-6 text-[#e4e1e7]">
      <section className="w-full max-w-[680px] rounded-2xl border border-[#4a4455] bg-[#1b1b1f] p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#7c3aed]/20">
            {error ? (
              <span className="material-symbols-outlined text-4xl text-red-400">
                error
              </span>
            ) : (
              <span className="material-symbols-outlined animate-spin text-4xl text-[#d2bbff]">
                progress_activity
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold">
            {error
              ? "Analysis Failed"
              : "Multi-Agent Pipeline Running"}
          </h1>

          <p className="mt-3 text-[#ccc3d8]">
            {error
              ? error
              : run?.message ||
                "Connecting to the analysis pipeline..."}
          </p>
        </div>

        {!error && (
          <>
            <div className="mt-8">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-[#ccc3d8]">
                  {run
                    ? statusLabels[run.status]
                    : "Starting"}
                </span>

                <span className="font-mono text-[#d2bbff]">
                  {progress}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#353439]">
                <div
                  className="h-full rounded-full bg-[#7c3aed] transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      Math.max(progress, 0),
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
              <StatusItem
                label="Transcript"
                complete={progress >= 35}
              />

              <StatusItem
                label="AI Analysis"
                complete={progress >= 70}
              />

              <StatusItem
                label="Final Report"
                complete={progress >= 80}
              />

              <StatusItem
                label="PDF Export"
                complete={progress >= 100}
              />
            </div>

            {run?.chunk_count &&
              run.status === "summarizing_chunks" && (
                <p className="mt-5 text-center text-xs text-[#958da1]">
                  Analysed{" "}
                  {run.completed_chunks ?? 0} of{" "}
                  {run.chunk_count} transcript sections
                </p>
              )}
          </>
        )}

        {error && (
          <button
            type="button"
            onClick={() =>
              router.replace("/summarize")
            }
            className="mx-auto mt-8 flex items-center gap-2 rounded-xl bg-[#7c3aed] px-6 py-3 font-medium text-white"
          >
            <span className="material-symbols-outlined">
              arrow_back
            </span>
            Return to summarizer
          </button>
        )}
      </section>
    </main>
  );
}

function StatusItem({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#4a4455] bg-[#1f1f23] p-3">
      <span
        className={[
          "material-symbols-outlined text-xl",
          complete
            ? "text-green-400"
            : "text-[#6f6878]",
        ].join(" ")}
      >
        {complete
          ? "check_circle"
          : "radio_button_unchecked"}
      </span>

      <span
        className={
          complete
            ? "text-[#e4e1e7]"
            : "text-[#958da1]"
        }
      >
        {label}
      </span>
    </div>
  );
}