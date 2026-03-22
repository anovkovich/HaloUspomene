export const metadata = { title: "Admin | HALO Uspomene", robots: "noindex" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e5e5e5]">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-wide text-white">
          HALO Uspomene <span className="text-[#AE343F]">Admin</span>
        </h1>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
