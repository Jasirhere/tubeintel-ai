export default function FeaturesSection() {
  return (
    <section id="features" className="py-16">
      <div className="mb-14 text-center">
        <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#e4e1e7]">
          Powerful Agentic Features
        </h2>

        <p className="mt-3 text-sm text-[#ccc3d8]">
          Engineered for researchers, creators, and data analysts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <article className="relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-3xl border border-[#2d2d3d] bg-[rgba(26,26,36,0.8)] p-8 backdrop-blur-xl hover:border-[#d2bbff]/50 md:col-span-4">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#d2bbff]/5 blur-3xl" />

          <div>
            <FeatureIcon icon="transcribe" />

            <h3 className="text-2xl font-semibold text-[#e4e1e7]">
              Transcript Extraction
            </h3>

            <p className="mt-4 text-sm leading-6 text-[#ccc3d8]">
              High-fidelity transcript extraction with structured text,
              optimized for long-form and technical video content.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-xl border border-[#4a4455]/50 bg-[#0e0e12]">
            <div className="border-b border-[#4a4455] px-4 py-2 font-mono text-[10px] text-[#ccc3d8]">
              transcript.md
            </div>

            <div className="space-y-2 p-4 font-mono text-[10px] text-[#958da1]">
              <p>
                <span className="text-[#d2bbff]">[00:00]</span> Welcome to the
                video...
              </p>
              <p>
                <span className="text-[#d2bbff]">[00:45]</span> The first core
                concept...
              </p>
              <p>
                <span className="text-[#d2bbff]">[02:12]</span> Multi-agent
                systems...
              </p>
            </div>
          </div>
        </article>

        <article className="flex min-h-[360px] flex-col gap-8 rounded-3xl border border-[#2d2d3d] bg-[rgba(26,26,36,0.8)] p-8 backdrop-blur-xl hover:border-[#d2bbff]/50 md:col-span-8 md:flex-row">
          <div className="flex flex-col justify-center md:w-1/2">
            <FeatureIcon icon="summarize" />

            <h3 className="text-2xl font-semibold text-[#e4e1e7]">
              Summary Generation
            </h3>

            <p className="mt-4 text-sm leading-6 text-[#ccc3d8]">
              Generate professional, academic, executive, or bullet-style
              summaries. User instructions can be added for customized output.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              <Tag>Recursive AI</Tag>
              <Tag>Custom Styles</Tag>
              <Tag>LLM Powered</Tag>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border border-[#4a4455] bg-[#0e0e12] p-5 font-mono text-xs md:w-1/2">
            <p className="text-[#7c3aed]">
              ● [ANALYSIS] Parsing transcript chunks...
            </p>

            <p className="mt-3 text-[#958da1]">
              &gt; Identifying core arguments...
            </p>

            <p className="mt-2 text-[#958da1]">
              &gt; Mapping evidence to conclusions...
            </p>

            <div className="mt-6 rounded-lg border border-[#4a4455]/40 bg-[#1f1f23] p-4 text-[#e4e1e7]">
              <strong>Executive Summary:</strong> The video explains how
              multi-agent AI systems divide complex tasks across specialized
              components...
            </div>

            <div className="mt-auto flex gap-2 pt-6">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#d2bbff]/20">
                <div className="h-full w-[75%] bg-[#d2bbff]" />
              </div>

              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#d2bbff]/20">
                <div className="h-full w-[90%] bg-[#7c3aed]" />
              </div>
            </div>
          </div>
        </article>

        <article className="flex min-h-[300px] flex-col gap-8 rounded-3xl border border-[#2d2d3d] bg-[rgba(26,26,36,0.8)] p-8 backdrop-blur-xl hover:border-[#d2bbff]/50 md:col-span-7 md:flex-row">
          <div className="rounded-2xl border border-[#4a4455] bg-[#0e0e12] p-6 md:w-1/2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#ccc3d8]">
                Quality Score
              </span>

              <span className="text-xl font-semibold text-[#d2bbff]">
                98.4%
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#4a4455]">
              <div className="h-full w-[98.4%] bg-gradient-to-r from-[#d2bbff] to-[#7c3aed]" />
            </div>

            <div className="mt-8 space-y-4">
              <QualityItem text="Hallucination check passed" />
              <QualityItem text="Factual verification complete" />
              <QualityItem text="Transcript grounding enabled" />
            </div>
          </div>

          <div className="flex flex-col justify-center md:w-1/2">
            <FeatureIcon icon="verified_user" />

            <h3 className="text-2xl font-semibold text-[#e4e1e7]">
              Quality Review
            </h3>

            <p className="mt-4 text-sm leading-6 text-[#ccc3d8]">
              Evaluation logic checks output quality, relevance, and grounding
              before the final content is shown to the user.
            </p>
          </div>
        </article>

        <article className="flex min-h-[300px] flex-col justify-between rounded-3xl border border-[#2d2d3d] bg-[rgba(26,26,36,0.8)] p-8 backdrop-blur-xl hover:border-[#d2bbff]/50 md:col-span-5">
          <div>
            <FeatureIcon icon="file_download" />

            <h3 className="text-2xl font-semibold text-[#e4e1e7]">
              PDF Export
            </h3>

            <p className="mt-4 text-sm leading-6 text-[#ccc3d8]">
              Download transcripts, Markdown summaries, and professional PDF
              reports for assignments, research, or documentation.
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-[#4a4455] bg-[#131317] p-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ffb4ab]">
                picture_as_pdf
              </span>

              <span className="text-xs font-bold">
                Deep_Analysis_v2.pdf
              </span>

              <span className="ml-auto text-xs text-[#ccc3d8]">
                2.4 MB
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function FeatureIcon({ icon }: { icon: string }) {
  return (
    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2a292e] text-[#d2bbff]">
      <span className="material-symbols-outlined">
        {icon}
      </span>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#d2bbff]/10 px-3 py-1 text-xs text-[#d2bbff]">
      {children}
    </span>
  );
}

function QualityItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-xs text-[#ccc3d8]">
      <span className="material-symbols-outlined text-[18px] text-green-400">
        check_circle
      </span>

      {text}
    </div>
  );
}