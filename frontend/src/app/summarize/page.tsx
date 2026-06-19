import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/dashboard/Sidebar";
import SummaryForm from "@/components/summarize/SummaryForm";

export default function SummarizePage() {
  return (
    <div className="min-h-screen bg-[#0f0f13] text-[#e4e1e7]">
      <Sidebar />

      <main className="ml-[240px] min-h-screen">
        <DashboardHeader />

        <section className="mx-auto max-w-[900px] px-6 py-12">
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-[32px] font-semibold leading-10 tracking-[-0.02em]">
              Create New Video Summary
            </h1>
            <p className="text-sm text-[#ccc3d8]">
              Configure your AI agents to analyze and compress long-form content.
            </p>
          </div>

          <SummaryForm />

          <div className="mt-8 flex items-start gap-6">
            <InfoCard
              icon="info"
              title="Agent Logic"
              accent="#d2bbff"
            >
              Our Multi-Agent architecture distributes tasks across specialized
              neural nodes. The <strong className="text-[#e4e1e7]">Linguist Agent</strong>{" "}
              parses audio, the <strong className="text-[#e4e1e7]">Summarizer Agent</strong>{" "}
              extracts core value, and the{" "}
              <strong className="text-[#e4e1e7]">Formatting Agent</strong> handles
              the final export structure.
            </InfoCard>

            <InfoCard
              icon="speed"
              title="Estimated Time"
              accent="#cebdff"
            >
              Processing time depends on the video length and the selected output
              formats. Keep this page open while the agents complete the analysis.
            </InfoCard>
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  accent,
  children,
}: {
  icon: string;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 rounded-lg border border-[#4a4455] bg-[#2a292e] p-3">
      <div className="mb-2 flex items-center gap-2" style={{ color: accent }}>
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
        <span className="text-sm font-bold uppercase tracking-wider">{title}</span>
      </div>
      <p className="text-xs leading-relaxed text-[#ccc3d8]">{children}</p>
    </div>
  );
}
