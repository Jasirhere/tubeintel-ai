import Link from "next/link";

const pipelineSteps = [
  {
    icon: "smart_display",
    label: "URL",
    type: "start",
  },
  {
    icon: "transcribe",
    label: "Transcript",
    type: "normal",
  },
  {
    icon: "data_object",
    label: "Preprocessing",
    type: "normal",
  },
  {
    icon: "summarize",
    label: "Summarization",
    type: "normal",
  },
  {
    icon: "verified",
    label: "Evaluation",
    type: "normal",
  },
  {
    icon: "picture_as_pdf",
    label: "INSIGHTS.PDF",
    type: "end",
  },
];

export default function HeroSection() {
  return (
    <section id="workflow" className="pb-16 pt-24 text-center">
      <div className="mx-auto mb-16 max-w-4xl space-y-6">
        <h1 className="text-4xl font-bold leading-tight tracking-[-0.02em] text-[#e4e1e7] md:text-5xl">
          Multi-Agent{" "}
          <span className="bg-gradient-to-r from-[#d2bbff] to-[#7c3aed] bg-clip-text text-transparent">
            YouTube Intelligence
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-base leading-6 text-[#ccc3d8]">
          Turn long videos into structured transcripts, summaries,
          quality-reviewed insights, and exportable PDFs using an AI agent
          workflow.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Link
            href="/summarize"
            className="flex items-center gap-3 rounded-xl bg-[#7c3aed] px-8 py-4 text-base font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.25)] hover:shadow-[0_0_30px_rgba(124,58,237,0.45)] active:scale-95"
          >
            Summarize a Video

            <span className="material-symbols-outlined">
              play_circle
            </span>
          </Link>

          <button className="rounded-xl border border-[#4a4455] px-8 py-4 text-base font-semibold text-[#e4e1e7] hover:bg-[#2a292e]">
            View Demo
          </button>
        </div>
      </div>

      <div className="relative mx-auto mt-24 max-w-5xl rounded-3xl border border-[#2d2d3d] bg-[rgba(26,26,36,0.8)] p-8 shadow-[0_0_25px_rgba(124,58,237,0.15)] backdrop-blur-xl md:p-12">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full border border-[#4a4455] bg-[#1f1f23] px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d2bbff]">
          Active Pipeline
        </div>

        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:gap-3">
          {pipelineSteps.map((step, index) => (
            <div key={step.label} className="contents">
              <div className="z-10 flex flex-col items-center gap-4">
                <div
                  className={[
                    "flex items-center justify-center border",
                    step.type === "start" || step.type === "end"
                      ? "h-16 w-16 rounded-2xl"
                      : "h-14 w-14 rounded-full",
                    step.type === "start"
                      ? "border-[#ffb4ab]/30 bg-[#ffb4ab]/10 text-[#ffb4ab]"
                      : step.type === "end"
                        ? "border-[#d2bbff]/30 bg-[#d2bbff]/10 text-[#d2bbff] shadow-[0_0_18px_rgba(210,187,255,0.2)]"
                        : "border-[#4a4455] bg-[#1f1f23] text-[#ccc3d8]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "material-symbols-outlined",
                      step.type === "start" || step.type === "end"
                        ? "text-3xl"
                        : "text-2xl",
                    ].join(" ")}
                  >
                    {step.icon}
                  </span>
                </div>

                <span
                  className={[
                    "text-xs",
                    step.type === "start" || step.type === "end"
                      ? "font-mono font-bold text-[#d2bbff]"
                      : "font-medium text-[#ccc3d8]",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>

              {index < pipelineSteps.length - 1 && (
                <div className="hidden h-px flex-1 border-t border-dashed border-[#4a4455] md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}