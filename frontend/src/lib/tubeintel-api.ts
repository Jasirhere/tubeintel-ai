const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8091";

export type SummaryStyle =
  | "Bullet Notes"
  | "Professional"
  | "Academic"
  | "Executive Brief";

export type RunStatus =
  | "queued"
  | "extracting_transcript"
  | "transcript_ready"
  | "indexing_transcript"
  | "rag_ready"
  | "summarizing_chunks"
  | "composing_report"
  | "summary_ready"
  | "generating_pdf"
  | "completed"
  | "failed";

export interface CreateRunPayload {
  youtube_url: string;
  preferred_languages?: string[];
  summary_style: SummaryStyle;
  optional_notes?: string;
}

export interface CreateRunResponse {
  run_id: string;
  status: RunStatus;
  progress: number;
  message: string;
  status_url: string;
}

export interface RunDetails {
  run_id: string;
  status: RunStatus;
  progress: number;
  message: string;

  youtube_url: string;
  video_id: string | null;
  video_title: string | null;
  channel_name: string | null;

  summary_style: SummaryStyle;
  optional_notes: string;

  language: string | null;
  language_code: string | null;
  is_generated: boolean | null;

  segment_count: number | null;
  character_count: number | null;
  thumbnail_url: string | null;
  transcript_preview: string | null;

  chunk_count: number | null;
  completed_chunks: number | null;
  summary_preview: string | null;
  vector_chunk_count: number | null;

  transcript_file: string | null;
  summary_file: string | null;
  pdf_file: string | null;

  error: string | null;

  created_at: string;
  updated_at: string;
}

interface ApiErrorResponse {
  detail?: string;
}

async function parseError(
  response: Response,
): Promise<string> {
  try {
    const data =
      (await response.json()) as ApiErrorResponse;

    return (
      data.detail ??
      `Request failed with status ${response.status}.`
    );
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

export async function createAnalysisRun(
  payload: CreateRunPayload,
): Promise<CreateRunResponse> {
  const response = await fetch(`${API_BASE_URL}/api/runs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      youtube_url: payload.youtube_url,
      preferred_languages:
        payload.preferred_languages ?? ["en"],
      summary_style: payload.summary_style,
      optional_notes: payload.optional_notes ?? "",
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as CreateRunResponse;
}

export async function getAnalysisRun(
  runId: string,
): Promise<RunDetails> {
  const response = await fetch(
    `${API_BASE_URL}/api/runs/${encodeURIComponent(runId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as RunDetails;
}

export function getArtifactUrl(
  artifactPath: string | null,
): string | null {
  if (!artifactPath) {
    return null;
  }

  if (
    artifactPath.startsWith("http://") ||
    artifactPath.startsWith("https://")
  ) {
    return artifactPath;
  }

  return `${API_BASE_URL}${artifactPath}`;
}

export async function getArtifactText(
  artifactPath: string | null,
): Promise<string | null> {
  const artifactUrl = getArtifactUrl(artifactPath);

  if (!artifactUrl) {
    return null;
  }

  const response = await fetch(artifactUrl, {
    method: "GET",
    headers: {
      Accept: "text/plain, text/markdown",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.text();
}

export interface ChatSource {
  chunk_id: number;
  text: string;
  relevance_score: number | null;
}

export interface ChatResponse {
  answer: string;
  is_relevant: boolean;
  sources: ChatSource[];
}

export async function askRunQuestion(
  runId: string,
  question: string,
): Promise<ChatResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/runs/${encodeURIComponent(runId)}/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        question: question.trim(),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as ChatResponse;
}