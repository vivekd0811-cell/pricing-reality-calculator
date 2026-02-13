import * as React from "react";

type Tone = "neutral" | "success" | "warning" | "danger";

interface ResultCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  neutral:
    "border-slate-700/80 bg-slate-900/60 shadow-[0_0_0_1px_rgba(148,163,184,0.15)]",
  success:
    "border-emerald-500/40 bg-emerald-950/40 shadow-[0_0_0_1px_rgba(52,211,153,0.25)]",
  warning:
    "border-amber-500/40 bg-amber-950/40 shadow-[0_0_0_1px_rgba(251,191,36,0.25)]",
  danger:
    "border-red-500/40 bg-red-950/40 shadow-[0_0_0_1px_rgba(248,113,113,0.25)]",
};

export function ResultCard({
  title,
  value,
  subtitle,
  tone = "neutral",
}: ResultCardProps) {
  return (
    <section
      className={`flex flex-col gap-1.5 rounded-xl border px-4 py-3 text-sm ${toneClasses[tone]}`}
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
        {title}
      </p>
      <div className="text-lg font-semibold text-slate-50">{value}</div>
      {subtitle && (
        <p className="text-xs leading-relaxed text-slate-300/90">
          {subtitle}
        </p>
      )}
    </section>
  );
}

