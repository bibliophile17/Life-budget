"use client";

import { useState } from "react";
import { HelpCircle, ListChecks, PiggyBank, TrendingUp } from "lucide-react";
import { useBudget } from "@/lib/use-budget";
import { cn } from "@/lib/utils";
import { AuthButton } from "@/components/auth-button";
import { PlanTab } from "@/components/plan-tab";
import { TrackTab } from "@/components/track-tab";
import { AffordTab } from "@/components/afford-tab";
import { FutureTab } from "@/components/future-tab";

const TABS = [
  { id: "plan", label: "Plan", icon: PiggyBank },
  { id: "track", label: "Track", icon: ListChecks },
  { id: "afford", label: "Can I afford?", icon: HelpCircle },
  { id: "future", label: "Future", icon: TrendingUp },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function AppShell() {
  const { state, update, user } = useBudget();
  const [tab, setTab] = useState<TabId>("plan");

  return (
    <main className="mx-auto max-w-3xl px-3.5 pb-16 pt-4">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-extrabold tracking-tight">LifeBudget</div>
          {state?.demo && <div className="text-xs text-stone-500">Demo data (fictional). Edit anything.</div>}
        </div>
        <AuthButton user={user} />
      </header>

      <nav className="sticky top-0 z-10 mb-4 flex gap-1 rounded-xl border border-stone-200 bg-white p-1 dark:border-stone-800 dark:bg-stone-900" aria-label="Sections">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-current={tab === id}
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-1 py-2 text-xs font-semibold sm:text-sm",
              tab === id ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900" : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className={cn(tab !== id && "hidden sm:inline")}>{label}</span>
          </button>
        ))}
      </nav>

      {!state ? (
        <div className="py-20 text-center text-sm text-stone-500">Loading your plan…</div>
      ) : tab === "plan" ? (
        <PlanTab s={state} update={update} />
      ) : tab === "track" ? (
        <TrackTab s={state} update={update} />
      ) : tab === "afford" ? (
        <AffordTab s={state} />
      ) : (
        <FutureTab s={state} update={update} />
      )}
    </main>
  );
}
