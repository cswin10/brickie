import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mesh bg-grid flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-3 mb-8 group">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-brick-500 to-brick-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative w-12 h-12 bg-gradient-to-br from-brick-500 to-brick-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🧱</span>
          </div>
        </div>
        <span className="text-2xl font-extrabold text-gradient">Brickie</span>
      </Link>
      {children}
    </div>
  );
}
