"use client";

import { useState } from "react";
import type { State } from "@/lib/types";
import { checkAfford } from "@/lib/finance";
import { cn, inr } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";

export function AffordTab({ s }: { s: State }) {
  const [a, setA] = useState("");
  const [cid, setCid] = useState<number>(s.cats.find((c) => c.k === "want")?.id ?? s.cats[0]?.id ?? 0);
  const r = checkAfford(s, cid, Number(a));
  const tone = r && { ok: "border-emerald-600 bg-emerald-50 dark:bg-emerald-950", warn: "border-amber-500 bg-amber-50 dark:bg-amber-950", bad: "border-red-600 bg-red-50 dark:bg-red-950" }[r.level];

  return (
    <Card>
      <CardTitle>Can I afford this?</CardTitle>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label htmlFor="aa" className="mt-0">Amount (₹)</Label>
          <Input id="aa" type="number" inputMode="numeric" min={0} placeholder="2000" value={a} onChange={(e) => setA(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="ac" className="mt-0">Category</Label>
          <Select id="ac" value={cid} onChange={(e) => setCid(Number(e.target.value))}>
            {s.cats.map((c) => <option key={c.id} value={c.id}>{c.n}</option>)}
          </Select>
        </div>
      </div>
      {!r ? (
        <p className="mt-4 text-sm text-stone-500">Enter an amount to see how it fits your plan.</p>
      ) : (
        <div className={cn("mt-4 rounded-lg border-l-4 p-3.5 text-sm", tone)}>
          <b className="mb-1 block text-base">{r.title}</b>
          <p>{r.msg}</p>
          <p className="mt-1">Free in {r.name} now: {inr(r.rem)}. Buffer left: {inr(r.buf)}.</p>
          <p className="mt-2 text-xs text-stone-500">If invested instead at your assumed {s.ret}% for 5 years, {inr(Number(a))} would hypothetically grow to {inr(r.fv)}. An assumption, not a promise.</p>
        </div>
      )}
    </Card>
  );
}
