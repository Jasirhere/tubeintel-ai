export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8090";

export type OutputFormat = "transcript" | "summary" | "pdf";

export type SummaryRequest = {
  youtube_url: string;
  summary_style: string;
  output_formats: OutputFormat[];
  optional_notes: string;
};

export type SummaryResponse = {
  run_id: string;
  status: string;
  youtube_url: string;
  transcript_file: string | null;
  summary_file: string | null;
  pdf_file: string | null;
  summary_text: string | null;
  transcript_preview: string | null;
  video_title: string | null;
  thumbnail_url: string | null;
  output_formats: OutputFormat[];
};

export type ChatSource = {
  chunk_id: number;
  text: string;
  relevance_score: number | null;
};

export type ChatResponse = {
  answer: string;
  is_relevant: boolean;
  sources: ChatSource[];
};

export async function createSummary(
  payload: SummaryRequest,
): Promise<SummaryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "The backend request failed.");
  }

  return response.json() as Promise<SummaryResponse>;
}

export async function askVideoQuestion(
  runId: string,
  question: string,
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/runs/${runId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "The chat request failed.");
  }

  return response.json() as Promise<ChatResponse>;
}

export function getDownloadUrl(
  runId: string,
  fileType: "transcript" | "summary" | "pdf",
) {
  return `${API_BASE_URL}/api/runs/${runId}/${fileType}`;
}
