export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#4a4455] bg-[#131317]/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <h2 className="text-xl font-bold text-[#e4e1e7]">New Summary</h2>

        <nav className="flex gap-4">
          <a href="#" className="border-b-2 border-[#d2bbff] pb-2 text-sm font-medium text-[#d2bbff]">
            Overview
          </a>
          <a href="#" className="text-sm font-medium text-[#ccc3d8] hover:text-[#e4e1e7]">
            Pipeline
          </a>
          <a href="#" className="text-sm font-medium text-[#ccc3d8] hover:text-[#e4e1e7]">
            Logs
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="group relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#958da1] group-focus-within:text-[#d2bbff]">
            search
          </span>
          <input
            className="w-64 rounded-full border border-[#4a4455] bg-[#1b1b1f] py-1.5 pl-10 pr-4 text-xs outline-none transition-all focus:border-[#d2bbff] focus:ring-1 focus:ring-[#d2bbff]"
            placeholder="Search analysis..."
            type="text"
          />
        </div>

        <button className="p-2 text-[#ccc3d8] hover:text-[#d2bbff]">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
    </header>
  );
}
