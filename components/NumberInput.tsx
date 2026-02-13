import * as React from "react";

interface NumberInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  min?: number;
  step?: number;
  required?: boolean;
  helperText?: string;
  error?: string;
}

export function NumberInput({
  id,
  label,
  value,
  onChange,
  prefix,
  min,
  step,
  required,
  helperText,
  error,
}: NumberInputProps) {
  const inputClasses =
    "block w-full rounded-md border bg-slate-900/40 border-slate-700 px-3 py-2 text-sm text-slate-50 shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80 focus-visible:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50";

  const wrapperClasses =
    "flex w-full items-center gap-2 rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/60";

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center justify-between text-sm font-medium text-slate-100"
      >
        <span>{label}</span>
        {required && (
          <span className="text-xs font-normal text-emerald-300/80">
            Required
          </span>
        )}
      </label>
      <div className={prefix ? wrapperClasses : ""}>
        {prefix && (
          <span className="text-sm text-slate-400 select-none">{prefix}</span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className={prefix ? "bg-transparent flex-1 border-0 outline-none text-sm text-slate-50 placeholder:text-slate-500" : inputClasses}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          min={min}
          step={step ?? 1}
        />
      </div>
      {helperText && !error && (
        <p className="text-xs text-slate-400">{helperText}</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

