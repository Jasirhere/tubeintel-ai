import Link from "next/link";

export default function CtaSection() {
  return (
    <section id="dashboard" className="mb-24 py-16">
      <div className="relative overflow-hidden rounded-[40px] border border-[#2d2d3d] bg-[rgba(26,26,36,0.8)] p-12 text-center shadow-[0_0_25px_rgba(124,58,237,0.15)] backdrop-blur-xl md:p-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d2bbff]/10 via-transparent to-[#4f319c]/10" />

        <div className="relative z-10 mx-auto max-w-2xl space-y-8">
          <h2 className="text-4xl font-bold leading-tight tracking-[-0.02em] text-[#e4e1e7] md:text-5xl">
            Ready to automate your intelligence?
          </h2>

          <p className="text-base leading-6 text-[#ccc3d8]">
            Transform long YouTube videos into structured knowledge,
            downloadable reports, and interactive AI-powered answers.
          </p>

          <div className="pt-4">
            <Link
              href="/summarize"
              className="inline-block rounded-full bg-[#7c3aed] px-12 py-5 text-base font-bold text-white shadow-xl hover:scale-105"
            >
              Get Started For Free
            </Link>
          </div>

          <p className="text-xs text-[#ccc3d8]/60">
            Enter a YouTube URL and let the AI workflow handle the rest.
          </p>
        </div>
      </div>
    </section>
  );
}