import Link from "next/link";

const navigation = [
  { icon: "dashboard", label: "Dashboard", href: "/" },
  { icon: "analytics", label: "Analysis", href: "/summarize", active: true },
  { icon: "smart_toy", label: "Agents", href: "#" },
  { icon: "video_library", label: "Library", href: "#" },
  { icon: "settings", label: "Settings", href: "#" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col gap-4 border-r border-[#4a4455] bg-[#0e0e12] p-4">
      <div className="mb-6 px-2">
        <Link href="/" className="text-xl font-bold text-[#d2bbff]">
          TubeIntel AI
        </Link>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-[#958da1]">
          v2.4.0-pro
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={[
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              item.active
                ? "bg-[#7c3aed]/10 font-bold text-[#d2bbff]"
                : "text-[#ccc3d8] hover:bg-[#2a292e] hover:text-[#e4e1e7]",
            ].join(" ")}
          >
            <span
              className="material-symbols-outlined"
              style={item.active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-1">
        <Link
          href="/summarize"
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#7c3aed] py-2.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(124,58,237,0.25)] hover:shadow-[0_0_30px_rgba(124,58,237,0.45)]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Analysis
        </Link>

        {[
          ["description", "Docs"],
          ["help_center", "Help"],
        ].map(([icon, label]) => (
          <a
            key={label}
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#ccc3d8] hover:bg-[#2a292e] hover:text-[#e4e1e7]"
          >
            <span className="material-symbols-outlined">{icon}</span>
            {label}
          </a>
        ))}

        <div className="mt-2 flex items-center gap-3 border-t border-[#4a4455]/30 px-3 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d2bbff]/30 bg-[#7c3aed]/20">
            <span className="material-symbols-outlined text-[20px] text-[#d2bbff]">
              person
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-medium text-[#e4e1e7]">Alex Rivera</p>
            <p className="truncate text-[10px] text-[#958da1]">Pro Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
