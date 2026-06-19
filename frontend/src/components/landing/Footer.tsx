const productLinks = [
  "Features",
  "Pricing",
  "API Docs",
  "Integrations",
];

const resourceLinks = [
  "Case Studies",
  "Blog",
  "Support",
  "Terms of Service",
];

export default function Footer() {
  return (
    <footer className="border-t border-[#4a4455] bg-[#0e0e12] px-6 py-16">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-12 md:grid-cols-4">
        <div className="space-y-6">
          <span className="text-xl font-black text-[#e4e1e7]">
            TubeIntel AI
          </span>

          <p className="max-w-xs text-xs leading-5 text-[#ccc3d8]">
            Professional YouTube intelligence powered by multi-agent AI,
            retrieval, and structured content generation.
          </p>

          <div className="flex gap-4">
            <SocialIcon icon="public" />
            <SocialIcon icon="alternate_email" />
          </div>
        </div>

        <FooterColumn
          title="Product"
          items={productLinks}
        />

        <FooterColumn
          title="Resources"
          items={resourceLinks}
        />

        <div>
          <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-[#e4e1e7]">
            Stay Updated
          </h4>

          <p className="mb-4 text-xs text-[#ccc3d8]">
            Get the latest updates on AI workflows.
          </p>

          <div className="flex gap-2">
            <input
              className="w-full rounded-lg border border-[#4a4455] bg-[#1f1f23] px-4 py-2 text-xs text-[#e4e1e7] outline-none placeholder:text-[#958da1] focus:border-[#7c3aed]"
              placeholder="Email address"
              type="email"
            />

            <button className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-bold text-white hover:brightness-110">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-[1600px] flex-col items-center justify-between gap-4 border-t border-[#4a4455] pt-8 md:flex-row">
        <p className="text-xs text-[#ccc3d8]">
          © 2026 TubeIntel AI. All rights reserved.
        </p>

        <div className="flex gap-6 text-xs text-[#ccc3d8]">
          <a href="#" className="hover:text-[#e4e1e7]">
            Privacy Policy
          </a>

          <a href="#" className="hover:text-[#e4e1e7]">
            Security
          </a>

          <a href="#" className="hover:text-[#e4e1e7]">
            Status
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-[#e4e1e7]">
        {title}
      </h4>

      <ul className="space-y-4 text-xs text-[#ccc3d8]">
        {items.map((item) => (
          <li key={item}>
            <a href="#" className="hover:text-[#d2bbff]">
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ icon }: { icon: string }) {
  return (
    <a
      href="#"
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#4a4455] bg-[#1f1f23] text-[#ccc3d8] hover:text-[#d2bbff]"
    >
      <span className="material-symbols-outlined">
        {icon}
      </span>
    </a>
  );
}