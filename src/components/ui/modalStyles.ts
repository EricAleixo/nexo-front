export const modalLabelClass = "text-xs font-semibold uppercase tracking-wider text-slate-500";

export const modalInputClass = (hasError = false) => [
    "w-full rounded-xl border bg-slate-50 px-4 py-3.5",
    "text-base font-medium text-slate-800 placeholder:text-slate-400",
    "outline-none transition-all duration-200",
    hasError
      ? "border-red-300 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100"
      : "border-slate-200 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100",
  ].join(" ");

export const modalCharCountClass = (atLimit: boolean) => [
    "absolute right-4 top-1/2 -translate-y-1/2 text-xs tabular-nums transition-colors",
    atLimit ? "text-amber-600" : "text-slate-400",
  ].join(" ");

export const modalPrimaryButtonClass = (loading = false) => [
    "flex w-full items-center justify-center gap-2 rounded-xl py-3.5",
    "text-sm font-semibold text-white shadow-sm transition-colors",
    "active:scale-[.98] disabled:cursor-not-allowed",
    loading ? "cursor-wait bg-blue-700" : "bg-blue-600 hover:bg-blue-700",
  ].join(" ");

export const modalErrorClass = "flex items-center gap-1.5 text-sm font-medium text-red-600";

export const modalErrorBoxClass = "flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3";

export const modalHintClass = "text-center text-xs text-slate-400";

export const modalKbdClass =
  "rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500";
