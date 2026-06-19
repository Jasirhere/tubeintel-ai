import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#4a4455] bg-[#131317]/90 px-6 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-[1600px] items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black text-[#e4e1e7]">
            TubeIntel AI
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-[#ccc3d8] hover:text-[#d2bbff]"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="text-sm font-medium text-[#ccc3d8] hover:text-[#d2bbff]"
            >
              Workflow
            </a>

            <a
              href="#dashboard"
              className="text-sm font-medium text-[#ccc3d8] hover:text-[#d2bbff]"
            >
              Dashboard
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm font-medium text-[#ccc3d8] hover:text-[#e4e1e7]">
            Login
          </button>

          <Link
            href="/summarize"
            className="rounded-lg bg-[#7c3aed] px-6 py-2.5 text-sm font-bold text-white hover:brightness-110 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}