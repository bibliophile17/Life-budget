"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Plus, RotateCcw, Trash2, Wand2 } from "lucide-react";
import type { Kind, State } from "@/lib/types";
import {
  amt, applyPreset, autoFix, briefing, catColor, clampPct, makeDemo, moveToSavings, round1, squeeze, sumKind, totalPct,
} from "@/lib/finance";
import { cn, inr } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";

interface Props { s: State; update: (f: (s: State) => State) => void }

const PRESETS: [string, number, number, number][] = [
  ["Balanced 50/30/20", 50, 30, 20],
  ["Saver 50/20/30", 50, 20, 30],
  ["Aggressive 45/15/40", 45, 15, 40],
];

export function PlanTab({ s, update }: Props) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Kind>("want");

  const tp = totalPct(s);
  const gap = 100 - tp;
  const saved = sumKind(s, "save");
  const rate = s.salary ? Math.round((saved / s.salary) * 100) : 0;

  const setCats = (f: (c: State["cats"]) => State["cats"]) => update((x) => ({ ...x, demo: false, cats: f(x.cats) }));
  const setPct = (id: number, p: number) => setCats((cs) => cs.map((c) => (c.id === id ? { ...c, p: round1(clampPct(p)) } : c)));
  const pie = s.cats.map((c, i) => ({ name: c.n, value: Math.round(amt(s, c)), fill: catColor(c, i) })).filter((d) => d.value > 0);

  return (
    <>
      <Card className="mb-3.5">
        <Label htmlFor="sal" className="mt-0">Monthly take-home salary</Label>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-1 text-3xl font-extrabold">
            ₹
            <Input
              id="sal" type="number" inputMode="numeric" min={0} step={1000} value={s.salary || ""}
              onChange={(e) => update((x) => ({ ...x, demo: false, salary: Math.max(0, Number(e.target.value) || 0) }))}
              className="h-auto w-44 border-0 border-b-2 bg-transparent px-0 py-0.5 text-3xl font-extrabold dark:bg-transparent"
            />
          </div>
          <div className="text-right">
            <div className="text-5xl font-extrabold leading-none tracking-tighter text-emerald-600 dark:text-emerald-400">{rate}%</div>
            <div className="text-xs text-stone-500">{inr(saved)} kept each month</div>
          </div>
        </div>

        <div className="mt-4 grid items-center gap-3 sm:grid-cols-[1fr_160px]">
          <div>
            <div className="flex h-4 overflow-hidden rounded bg-stone-200 dark:bg-stone-800" role="img" aria-label="Salary allocation">
              {s.cats.map((c, i) => (
                <div key={c.id} title={`${c.n} ${inr(amt(s, c))}`} style={{ width: `${(Math.max(0, c.p) / Math.max(100, tp)) * 100}%`, background: catColor(c, i) }} className="border-r-2 border-white dark:border-stone-900" />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold">
              {Math.abs(gap) < 0.05 ? <span className="text-emerald-600">Every rupee has a job.</span>
                : gap > 0 ? <span className="text-amber-600">{inr((s.salary * gap) / 100)} unallocated</span>
                : <span className="text-red-600">Over by {inr((-s.salary * gap) / 100)}. Shortfall, adjust below.</span>}
              {gap > 0.05 && <Button size="sm" onClick={() => setCats(moveToSavings)}>Move to savings</Button>}
              {gap < -0.05 && <Button size="sm" onClick={() => setCats(autoFix)}>Auto-fix</Button>}
            </div>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={36} outerRadius={58} stroke="none">
                  {pie.map((d) => <Cell key={d.name} fill={d.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => inr(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <p className="mt-3 text-sm text-stone-500">{briefing(s)}</p>
      </Card>

      <Card>
        <CardTitle>Split rules (needs / wants / saving)</CardTitle>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(([label, n, w, sv]) => (
            <Button key={label} variant="outline" size="sm" onClick={() => setCats((cs) => applyPreset(cs, n, w, sv))}>{label}</Button>
          ))}
          <Button size="sm" onClick={() => setCats(squeeze)}><Wand2 className="h-3.5 w-3.5" /> Squeeze wants −30%</Button>
        </div>

        <div className="mt-2">
          {s.cats.map((c, i) => (
            <div key={c.id} className="border-t border-stone-200 py-3 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: catColor(c, i) }} />
                <b className="flex-1 text-sm">{c.n}</b>
                <span className="rounded border border-stone-200 px-1.5 text-[11px] text-stone-500 dark:border-stone-700">{c.k === "save" ? "saving" : c.k}</span>
                <Button variant="ghost" size="icon" aria-label={`Remove ${c.n}`} onClick={() => update((x) => ({ ...x, demo: false, cats: x.cats.filter((k) => k.id !== c.id), spend: x.spend.filter((e) => e.c !== c.id) }))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-1.5 grid grid-cols-[1fr_104px_48px] items-center gap-2.5">
                <input type="range" min={0} max={100} step={0.5} value={c.p} onChange={(e) => setPct(c.id, Number(e.target.value))} aria-label={`${c.n} percent`} className="accent-emerald-600" />
                <Input type="number" min={0} step={500} value={Math.round(amt(s, c))} aria-label={`${c.n} amount`} onChange={(e) => setPct(c.id, s.salary ? (Number(e.target.value) / s.salary) * 100 : 0)} />
                <span className="text-right text-xs text-stone-500">{c.p.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>

        <CardTitle className="mt-4">Add a category</CardTitle>
        <div className="grid grid-cols-[1fr_110px_auto] gap-2">
          <Input placeholder="e.g. Gym" maxLength={24} value={name} onChange={(e) => setName(e.target.value)} aria-label="Category name" />
          <Select value={kind} onChange={(e) => setKind(e.target.value as Kind)} aria-label="Type">
            <option value="need">Need</option><option value="want">Want</option><option value="save">Saving</option>
          </Select>
          <Button disabled={!name.trim()} onClick={() => { update((x) => ({ ...x, demo: false, nid: x.nid + 1, cats: [...x.cats, { id: x.nid, n: name.trim(), k: kind, p: 0 }] })); setName(""); }}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <p className="mt-3 flex items-center justify-between gap-2 text-xs text-stone-500">
          Percentages scale with your salary, so the plan works for any income.
          <Button variant="outline" size="sm" className={cn("shrink-0")} onClick={() => update(() => makeDemo())}><RotateCcw className="h-3.5 w-3.5" /> Reset to demo</Button>
        </p>
      </Card>
    </>
  );
}
