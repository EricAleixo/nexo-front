import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface AuthPageLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthPageLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthPageLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-linear-to-b from-blue-50 to-transparent"
      />

      <div className="relative z-10 w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ChevronLeft className="size-4" />
          Voltar para o início
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white">
                Q
              </div>
              <span className="text-2xl font-bold text-slate-800">StudyHub</span>
            </Link>
            <h1 className="mt-6 text-xl font-bold text-slate-800">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>

          {children}

          <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>
        </div>
      </div>
    </main>
  );
}
