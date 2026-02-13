"use client";

import { useMemo, useState } from "react";
import { NumberInput } from "@/components/NumberInput";
import { ResultCard } from "@/components/ResultCard";
import { calculate, type CalculatorField } from "@/lib/calc";
import { formatCurrencyInr, formatNumber, parseNumber } from "@/lib/format";

export default function Home() {
  const [pricePerClient, setPricePerClient] = useState("50000");
  const [costPerClient, setCostPerClient] = useState("15000");
  const [fixedCost, setFixedCost] = useState("200000");
  const [targetProfit, setTargetProfit] = useState("100000");
  const [currentClients, setCurrentClients] = useState("10");

  const parsedInput = useMemo(
    () => ({
      pricePerClient: parseNumber(pricePerClient),
      costPerClient: parseNumber(costPerClient),
      fixedCost: parseNumber(fixedCost),
    }),
    [pricePerClient, costPerClient, fixedCost],
  );

  const result = useMemo(() => calculate(parsedInput), [parsedInput]);

  const targetProfitValue = parseNumber(targetProfit);
  const currentClientsValue = parseNumber(currentClients);

  const incomeReality = useMemo(() => {
    if (
      !result.isValid ||
      result.contributionPerClient == null ||
      result.contributionPerClient <= 0 ||
      targetProfitValue == null ||
      targetProfitValue < 0 ||
      parsedInput.fixedCost == null ||
      parsedInput.pricePerClient == null ||
      parsedInput.costPerClient == null
    ) {
      return {
        requiredClients: null,
        requiredRevenue: null,
        requiredPriceAtCurrentClients: null,
      };
    }

    const fc = parsedInput.fixedCost;
    const price = parsedInput.pricePerClient;
    const vc = parsedInput.costPerClient;
    const contributionPerClient = result.contributionPerClient;

    const requiredClients = Math.ceil(
      (fc + targetProfitValue) / contributionPerClient,
    );
    const requiredRevenue = requiredClients * price;

    let requiredPriceAtCurrentClients: number | null = null;
    if (currentClientsValue != null && currentClientsValue > 0) {
      requiredPriceAtCurrentClients =
        (fc + targetProfitValue) / currentClientsValue + vc;
    }

    return {
      requiredClients,
      requiredRevenue,
      requiredPriceAtCurrentClients,
    };
  }, [
    result,
    targetProfitValue,
    parsedInput.fixedCost,
    parsedInput.pricePerClient,
    parsedInput.costPerClient,
    currentClientsValue,
  ]);

  const getFieldError = (field: CalculatorField) =>
    result.errors.find((e) => e.field === field)?.message;

  return (
    <main className="flex min-h-screen justify-center bg-slate-950 px-4 py-8 text-slate-50">
      <div className="flex w-full max-w-6xl flex-col gap-8 rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.9),0_40px_120px_rgba(15,23,42,0.9)] sm:p-8 lg:p-10">
        <header className="flex flex-col gap-3 border-b border-slate-800/70 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
              Pricing reality check
            </p>
            <h1 className="text-2xl font-semibold leading-snug sm:text-3xl">
              Break-even &amp; Pricing Reality Calculator
            </h1>
            <p className="max-w-2xl text-sm text-slate-300/90">
              For service and retainer businesses that sell monthly retainers.
              Plug in your pricing and costs to see how many clients you need
              just to stand still.
            </p>
          </div>
          <div className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-900/10 px-4 py-3 text-xs text-emerald-100/90 sm:mt-0 sm:max-w-xs">
            <p className="font-medium text-emerald-300">
              All numbers are monthly and in INR (₹).
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-emerald-100/80">
              This is a quick, opinionated sanity check. It&apos;s not a full
              financial model.
            </p>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              1 · Unit economics inputs
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberInput
                id="price"
                label="Price per client (₹ / month)"
                prefix="₹"
                value={pricePerClient}
                onChange={setPricePerClient}
                min={0}
                required
                helperText="What you invoice a typical client every month."
                error={getFieldError("pricePerClient")}
              />
              <NumberInput
                id="cost"
                label="Cost to serve one client (₹ / month)"
                prefix="₹"
                value={costPerClient}
                onChange={setCostPerClient}
                min={0}
                required
                helperText="All variable delivery costs tied to that client."
                error={getFieldError("costPerClient")}
              />
              <NumberInput
                id="fixed-cost"
                label="Monthly fixed cost (₹)"
                prefix="₹"
                value={fixedCost}
                onChange={setFixedCost}
                min={0}
                required
                helperText="Salaries, rent, tools, founder pay, etc."
                error={getFieldError("fixedCost")}
              />
            </div>
            {result.errors.length === 0 && (
              <p className="text-[11px] text-slate-400">
                Tip: Play with &ldquo;cost to serve&rdquo; and{" "}
                &ldquo;fixed cost&rdquo; to see how operational decisions shift
                your break-even point.
              </p>
            )}
          </div>

          <div className="space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              2 · Break-even &amp; pricing reality
            </h2>
            <div className="grid gap-3">
              <ResultCard
                title="Contribution per client"
                value={
                  result.contributionPerClient != null
                    ? formatCurrencyInr(result.contributionPerClient)
                    : "—"
                }
                subtitle="How much is left from each client after direct delivery costs."
                tone={
                  !result.isValid
                    ? "neutral"
                    : result.contributionPerClient != null &&
                      result.contributionPerClient <= 0
                    ? "danger"
                    : "success"
                }
              />
              <ResultCard
                title="Gross margin on each client"
                value={
                  result.contributionMarginPct != null
                    ? `${result.contributionMarginPct.toFixed(1)}%`
                    : "—"
                }
                subtitle="Healthy retainers typically sit at 40–70% gross margin."
                tone={
                  !result.isValid
                    ? "neutral"
                    : result.contributionMarginPct != null &&
                      result.contributionMarginPct < 20
                    ? "danger"
                    : result.contributionMarginPct != null &&
                      result.contributionMarginPct < 35
                    ? "warning"
                    : "success"
                }
              />
              <ResultCard
                title="Clients to break even"
                value={
                  result.breakEvenClients != null
                    ? `${formatNumber(result.breakEvenClients)} client${
                        result.breakEvenClients === 1 ? "" : "s"
                      }`
                    : result.isValid
                    ? "No finite break-even"
                    : "—"
                }
                subtitle="Number of paying clients you need each month just to cover your fixed costs."
                tone={
                  !result.isValid
                    ? "neutral"
                    : result.breakEvenClients == null
                    ? "danger"
                    : result.breakEvenClients <= 10
                    ? "success"
                    : result.breakEvenClients <= 25
                    ? "warning"
                    : "danger"
                }
              />
              <ResultCard
                title="Monthly revenue at break-even"
                value={
                  result.breakEvenRevenue != null
                    ? formatCurrencyInr(result.breakEvenRevenue)
                    : result.isValid
                    ? "Not reachable with current pricing"
                    : "—"
                }
                subtitle="Revenue level where the business stops burning cash and starts earning true margin."
                tone={
                  !result.isValid
                    ? "neutral"
                    : result.breakEvenRevenue == null
                    ? "danger"
                    : "neutral"
                }
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-emerald-500/50 bg-emerald-950/40 px-4 py-4 text-xs text-slate-50 shadow-[0_0_0_1px_rgba(16,185,129,0.45)] sm:px-5 sm:py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Income Reality Mode
              </h2>
              <p className="max-w-2xl text-[13px] text-emerald-100/90">
                Instead of just breaking even, how many clients and what pricing
                do you need to hit a target monthly profit?
              </p>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-3">
              <NumberInput
                id="target-profit"
                label="Target monthly profit (₹)"
                prefix="₹"
                value={targetProfit}
                onChange={setTargetProfit}
                min={0}
                helperText="How much true profit you want to pay founders / reinvest every month."
              />
              <NumberInput
                id="current-clients"
                label="Current clients (Q)"
                value={currentClients}
                onChange={setCurrentClients}
                min={0}
                helperText="How many active, paying clients you realistically want to hold at this pricing."
              />
            </div>
            <div className="grid gap-3">
              <ResultCard
                title="Clients required to earn target profit"
                value={
                  incomeReality.requiredClients != null
                    ? `${formatNumber(incomeReality.requiredClients)} client${
                        incomeReality.requiredClients === 1 ? "" : "s"
                      }`
                    : result.isValid
                    ? "Not reachable with current pricing"
                    : "—"
                }
                subtitle="How many clients you need (at this price and cost structure) to hit your profit goal."
                tone={
                  !result.isValid
                    ? "neutral"
                    : incomeReality.requiredClients == null
                    ? "danger"
                    : incomeReality.requiredClients <= 10
                    ? "success"
                    : incomeReality.requiredClients <= 25
                    ? "warning"
                    : "danger"
                }
              />
              <ResultCard
                title="Required monthly revenue"
                value={
                  incomeReality.requiredRevenue != null
                    ? formatCurrencyInr(incomeReality.requiredRevenue)
                    : result.isValid
                    ? "Not reachable with current pricing"
                    : "—"
                }
                subtitle="Total top-line you need to reliably produce your target monthly profit."
                tone={
                  !result.isValid
                    ? "neutral"
                    : incomeReality.requiredRevenue == null
                    ? "danger"
                    : "neutral"
                }
              />
              <ResultCard
                title="Required price per client at current Q"
                value={
                  incomeReality.requiredPriceAtCurrentClients != null
                    ? formatCurrencyInr(
                        incomeReality.requiredPriceAtCurrentClients,
                      )
                    : currentClientsValue == null || currentClientsValue === 0
                    ? "—"
                    : result.isValid
                    ? "Not reachable with current economics"
                    : "—"
                }
                subtitle={
                  currentClientsValue == null || currentClientsValue === 0
                    ? "Set current clients above 0 to compute required price."
                    : "What you would need to charge each client (at your chosen client count) to hit this profit target."
                }
                tone={
                  !result.isValid
                    ? "neutral"
                    : incomeReality.requiredPriceAtCurrentClients == null
                    ? "warning"
                    : "neutral"
                }
              />
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 px-4 py-3 text-xs text-slate-200 sm:px-5 sm:py-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            3 · Reality check notes
          </h2>
          {result.errors.length > 0 ? (
            <ul className="list-disc space-y-1 pl-4 text-[13px] text-red-300">
              {result.errors.map((error) => (
                <li key={`${error.field}-${error.message}`}>{error.message}</li>
              ))}
            </ul>
          ) : (
            <>
              {result.warnings.length > 0 ? (
                <ul className="list-disc space-y-1 pl-4 text-[13px]">
                  {result.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-emerald-200/90">
                  Your pricing and cost structure look robust at a quick glance.
                  Use this as a starting point for a deeper financial model, not
                  a replacement.
                </p>
              )}
              <p className="text-[11px] text-slate-400">
                Assumptions: all inputs are monthly; churn, collection delays,
                sales capacity, and taxes are ignored. Always layer this on top
                of your own spreadsheets and judgment.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

