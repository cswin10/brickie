import Link from "next/link";
import { Ruler } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-warm-100 flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center space-x-3 mb-8">
        <div className="w-12 h-12 bg-brick-500 rounded-xl flex items-center justify-center shadow-lg">
          <Ruler className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-warm-900">Brickie</span>
      </Link>
      {children}
    </div>
  );
}
