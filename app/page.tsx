"use client";

import { useMemo, useState } from "react";
import { NumberInput } from "@/components/NumberInput";
import { ResultCard } from "@/components/ResultCard";
import { calculate, type CalculatorField } from "@/lib/calc";
import { formatNumber, parseNumber } from "@/lib/format";

type CurrencyCode = "USD" | "EUR" | "GBP" | "INR";
type PricingState = "losing" | "unsustainable" | "fragile" | "healthy";

const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "USD", label: "USD ($) — US Dollar" },
  { code: "EUR", label: "EUR (€) — Euro" },
  { code: "GBP", label: "GBP (£) — British Pound" },
  { code: "INR", label: "INR (₹) — Indian Rupee" },
];

const SITE_URL = "https://pricing-reality-calculator.vercel.app/";
const WAITLIST_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdIR5yyhZkBTTKpNF7d-sqGWmR0g87xSvvEmkNr000YlB2VOA/viewform";

export default function Home() {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [copied, setCopied] = useState(false);

  const [pricePerClient, setPricePerClient] = useState("5000");
  const [costPerClient, setCostPerClient] = useState("1500");
  const [fixedCost, setFixedCost] = useState("20000");
  const [targetProfit, setTargetProfit] = useState("10000");
  const [currentClients, setCurrentClients] = useState("10");

  const currencySymbol = useMemo(() => {
    const parts = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
    }).formatToParts(0);

    return parts.find((p) => p.type === "currency")?.value ?? "$";
  }, [currency]);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value));

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

  const pricingState = useMemo<PricingState>(() => {
    if (
      result.contributionPerClient != null &&
      result.contributionPerClient <= 0
    ) {
      return "losing";
    }

    if (
      result.contributionMarginPct != null &&
      (result.contributionMarginPct < 30 ||
        (result.breakEvenClients != null && result.breakEvenClients > 20))
    ) {
      return "unsustainable";
    }

    if (
      result.contributionMarginPct != null &&
      (result.contributionMarginPct < 50 ||
        (result.breakEvenClients != null && result.breakEvenClients > 10))
    ) {
      return "fragile";
    }

    return "healthy";
  }, [
    result.contributionPerClient,
    result.contributionMarginPct,
    result.breakEvenClients,
  ]);

  const realityCheckContent = useMemo(() => {
    switch (pricingState) {
      case "losing":
        return {
          title: "You are losing money on every client.",
          body: "More sales will make the problem worse. Your pricing or delivery costs need to change immediately.",
          shortLabel: "Losing money on every client",
          shortTakeaway:
            "More sales make the problem worse unless pricing or delivery costs change.",
          border: "border-rose-500/40",
          bg: "bg-rose-950/20",
          eyebrow: "text-rose-300",
        };
      case "unsustainable":
        return {
          title: "Your current pricing is likely unsustainable.",
          body: "You need better pricing, lower delivery costs, or both. Right now your model depends on too many clients to stay healthy.",
          shortLabel: "Unsustainable pricing",
          shortTakeaway:
            "Your margins are too thin for a stable, resilient business.",
          border: "border-amber-500/40",
          bg: "bg-amber-950/20",
          eyebrow: "text-amber-300",
        };
      case "fragile":
        return {
          title: "Your pricing is survivable, but fragile.",
          body: "One bad month, discount, or a few lost clients could hurt the business more than you think.",
          shortLabel: "Fragile pricing",
          shortTakeaway:
            "You can survive, but there is not much room for error.",
          border: "border-yellow-500/40",
          bg: "bg-yellow-950/20",
          eyebrow: "text-yellow-300",
        };
      case "healthy":
      default:
        return {
          title: "You have a viable pricing model.",
          body: "Your economics look healthy at a quick glance. Now the goal is to protect and improve that margin as you grow.",
          shortLabel: "Healthy pricing",
          shortTakeaway:
            "Your pricing has enough room to support a real business.",
          border: "border-emerald-500/40",
          bg: "bg-emerald-950/20",
          eyebrow: "text-emerald-300",
        };
    }
  }, [pricingState]);

  const proCta = useMemo(() => {
    switch (pricingState) {
      case "losing":
        return {
          title: "Get early access to the Pro version",
          body:
            "Test pricing changes, cost cuts, and survival scenarios before you add more clients and deepen the loss.",
          button: "Get Pro Version – Join Waitlist (Early Access)",
        };
      case "unsustainable":
        return {
          title: "Stress test your pricing before it hurts growth",
          body:
            "Compare pricing options, margins, and client targets before thin economics become a bigger problem.",
          button: "Get Pro Version – Join Waitlist (Early Access)",
        };
      case "fragile":
        return {
          title: "Create more margin before a bad month hits",
          body:
            "Model churn, founder salary, and runway so fragile pricing does not turn into a cash problem.",
          button: "Get Pro Version – Join Waitlist (Early Access)",
        };
      case "healthy":
      default:
        return {
          title: "Your pricing works — now optimize it further",
          body:
            "Use the Pro version to compare scenarios, plan founder pay, and model more realistic growth decisions.",
          button: "Get Pro Version – Join Waitlist (Early Access)",
        };
    }
  }, [pricingState]);

  const shareText = useMemo(() => {
    const breakEvenClientsText =
      result.breakEvenClients != null
        ? `${formatNumber(result.breakEvenClients)}`
        : "Not reachable";

    const breakEvenRevenueText =
      result.breakEvenRevenue != null
        ? formatMoney(result.breakEvenRevenue)
        : "Not reachable";

    const marginText =
      result.contributionMarginPct != null
        ? `${result.contributionMarginPct.toFixed(1)}%`
        : "—";

    return `I ran my numbers through the Break-even & Pricing Reality Calculator.

Result: ${realityCheckContent.shortLabel}
Break-even clients: ${breakEvenClientsText}
Break-even revenue: ${breakEvenRevenueText}
Gross margin: ${marginText}

${realityCheckContent.shortTakeaway}

Check your own pricing reality:
${SITE_URL}`;
  }, [
    realityCheckContent.shortLabel,
    realityCheckContent.shortTakeaway,
    result.breakEvenClients,
    result.breakEvenRevenue,
    result.contributionMarginPct,
  ]);

  const shareUrl = useMemo(() => encodeURIComponent(shareText), [shareText]);

  const waitlistUrlWithContext = useMemo(() => {
    const params = new URLSearchParams({
      source: "pricing-reality-calculator",
      result: realityCheckContent.shortLabel,
      breakEvenClients:
        result.breakEvenClients != null
          ? String(result.breakEvenClients)
          : "not-reachable",
      breakEvenRevenue:
        result.breakEvenRevenue != null
          ? String(Math.round(result.breakEvenRevenue))
          : "not-reachable",
      grossMargin:
        result.contributionMarginPct != null
          ? result.contributionMarginPct.toFixed(1)
          : "na",
      currency,
      pricePerClient: parsedInput.pricePerClient != null
        ? String(parsedInput.pricePerClient)
        : "na",
      costPerClient: parsedInput.costPerClient != null
        ? String(parsedInput.costPerClient)
        : "na",
      fixedCost: parsedInput.fixedCost != null
        ? String(parsedInput.fixedCost)
        : "na",
      targetProfit: targetProfitValue != null ? String(targetProfitValue) : "na",
      currentClients:
        currentClientsValue != null ? String(currentClientsValue) : "na",
    });

    return `${WAITLIST_FORM_URL}?usp=pp_url&${params.toString()}`;
  }, [
    realityCheckContent.shortLabel,
    result.breakEvenClients,
    result.breakEvenRevenue,
    result.contributionMarginPct,
    currency,
    parsedInput.pricePerClient,
    parsedInput.costPerClient,
    parsedInput.fixedCost,
    targetProfitValue,
    currentClientsValue,
  ]);

  const trackEvent = (
    eventName: string,
    extra?: Record<string, string | number | null>,
  ) => {
    if (typeof window === "undefined") return;

    const payload = {
      event: eventName,
      calculator_name: "pricing_reality_calculator",
      pricing_state: pricingState,
      result_label: realityCheckContent.shortLabel,
      currency,
      break_even_clients: result.breakEvenClients,
      break_even_revenue:
        result.breakEvenRevenue != null
          ? Math.round(result.breakEvenRevenue)
          : null,
      gross_margin_pct:
        result.contributionMarginPct != null
          ? Number(result.contributionMarginPct.toFixed(1))
          : null,
      ...extra,
    };

    const win = window as Window & {
      dataLayer?: Array<Record<string, unknown>>;
      gtag?: (...args: unknown[]) => void;
    };

    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push(payload);

    if (typeof win.gtag === "function") {
      win.gtag("event", eventName, payload);
    }
  };

  const openWaitlist = (placement: "top" | "results" | "bottom") => {
    trackEvent("waitlist_cta_click", { placement });
    window.open(waitlistUrlWithContext, "_blank", "noopener,noreferrer");
  };

  const handleCopyResult = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      trackEvent("copy_result_click");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

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
              A brutally simple calculator for service and retainer businesses.
              Plug in your pricing and costs to see whether your model can
              actually support a real business.
            </p>
          </div>

          <div className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-900/10 px-4 py-3 text-xs text-emerald-100/90 sm:mt-0 sm:max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full max-w-[240px] rounded-md border border-emerald-500/30 bg-slate-950/60 px-2 py-1 text-xs text-emerald-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  {CURRENCY_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <p className="font-medium text-emerald-300">
                All numbers are monthly and in {currency} ({currencySymbol}).
              </p>
            </div>

            <p className="mt-1 text-[11px] leading-relaxed text-emerald-100/80">
              This is a quick, opinionated sanity check. It&apos;s not a full
              financial model.
            </p>
          </div>
        </header>

        <section className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 to-slate-900/60 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Early access
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                Get Pro Version – Join Waitlist (Early Access)
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Be the first to access advanced pricing insights, scenario
                comparison, churn impact, and profit planning tools built for
                service businesses.
              </p>
            </div>

            <div className="flex flex-col gap-2 lg:items-end">
              <button
                onClick={() => openWaitlist("top")}
                className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Get Pro Version – Join Waitlist
              </button>
              <p className="text-xs text-slate-400">
                No payment now. Just join the early-access waitlist.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              1 · Unit economics inputs
            </h2>

            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
              <NumberInput
                id="price"
                label="Price per client (/ month)"
                prefix={currencySymbol}
                value={pricePerClient}
                onChange={setPricePerClient}
                min={0}
                required
                helperText="What you invoice a typical client every month."
                error={getFieldError("pricePerClient")}
              />

              <NumberInput
                id="cost"
                label="Cost to serve one client (/ month)"
                prefix={currencySymbol}
                value={costPerClient}
                onChange={setCostPerClient}
                min={0}
                required
                helperText="All variable delivery costs tied to that client."
                error={getFieldError("costPerClient")}
              />

              <div className="md:col-span-2">
                <NumberInput
                  id="fixed-cost"
                  label="Monthly fixed cost"
                  prefix={currencySymbol}
                  value={fixedCost}
                  onChange={setFixedCost}
                  min={0}
                  required
                  helperText="Salaries, rent, tools, founder pay, etc."
                  error={getFieldError("fixedCost")}
                />
              </div>
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
              <div
                className={`rounded-xl border px-4 py-3 ${realityCheckContent.border} ${realityCheckContent.bg}`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.22em] ${realityCheckContent.eyebrow}`}
                >
                  Founder Reality Check
                </p>

                <h3 className="mt-2 text-lg font-semibold text-white">
                  {realityCheckContent.title}
                </h3>

                <p className="mt-2 text-sm text-slate-300">
                  {realityCheckContent.body}
                </p>
              </div>

              <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Share this result
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-white">
                      {realityCheckContent.shortLabel}
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {realityCheckContent.shortTakeaway}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleCopyResult}
                      className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                    >
                      {copied ? "Copied" : "Copy result"}
                    </button>

                    <button
                      onClick={() =>
                        window.open(
                          `https://twitter.com/intent/tweet?text=${shareUrl}`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                    >
                      Share on X
                    </button>

                    <button
                      onClick={() =>
                        window.open(
                          `https://www.linkedin.com/feed/?shareActive=true&text=${shareUrl}`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                    >
                      Share on LinkedIn
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-xs text-slate-400">Break-even clients</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {result.breakEvenClients != null
                        ? formatNumber(result.breakEvenClients)
                        : "—"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-xs text-slate-400">Break-even revenue</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {result.breakEvenRevenue != null
                        ? formatMoney(result.breakEvenRevenue)
                        : "—"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-xs text-slate-400">Gross margin</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {result.contributionMarginPct != null
                        ? `${result.contributionMarginPct.toFixed(1)}%`
                        : "—"}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Know another founder who may be underpricing? Send them this
                  tool.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/25 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                      Next step
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-white">
                      Get Pro Version – Join Waitlist (Early Access)
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      Want deeper planning than this free calculator? Join the
                      waitlist for advanced pricing, scenario, churn, and profit
                      tools.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <button
                      onClick={() => openWaitlist("results")}
                      className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                    >
                      Get Pro Version – Join Waitlist
                    </button>
                    <p className="text-xs text-slate-400">
                      2 minutes. No payment now.
                    </p>
                  </div>
                </div>
              </div>

              <ResultCard
                title="Contribution per client"
                value={
                  result.contributionPerClient != null
                    ? formatMoney(result.contributionPerClient)
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
                    ? formatMoney(result.breakEvenRevenue)
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
                label="Target monthly profit"
                prefix={currencySymbol}
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
                    ? formatMoney(incomeReality.requiredRevenue)
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
                    ? formatMoney(incomeReality.requiredPriceAtCurrentClients)
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

        <section className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 to-slate-900/60 p-6 text-center">
          <h3 className="text-lg font-semibold text-emerald-300">
            🚀 {proCta.title}
          </h3>

          <p className="mt-2 text-sm text-slate-300">{proCta.body}</p>

          <p className="mt-3 text-sm font-medium text-emerald-300">
            👉 Most founders don’t realize this until it’s too late.
          </p>

          <p className="mt-4 text-sm text-slate-300">
            The Pro version includes:
            <br />
            • 12-month profit projection
            <br />
            • Scenario comparison (3 pricing models)
            <br />
            • Churn impact calculator
            <br />
            • Founder salary planning
            <br />
            • Runway analysis
          </p>

          <button
            onClick={() => openWaitlist("bottom")}
            className="mt-4 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400"
          >
            {proCta.button}
          </button>

          <p className="mt-2 text-xs text-slate-400">
            Be the first to access advanced pricing insights and profit tools.
          </p>
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
