"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { State } from "@/lib/types";
import { amt, monthKey, spentOf } from "@/lib/finance";
import { cn, inr } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";

interface Props { s: State; update: (f: (s: State) => State) => void }

export function TrackTab({ s, update }: Props) {
  const [cid, setCid] = useState<number>(s.cats[0]?.id ?? 0);
  const [a, setA] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  const add = () => {
    const n = Number(a);
    if (!(n > 0)) { setErr("Enter an amount above 0."); return; }
    if (!s.cats.some((c) => c.id === cid)) { setErr("Pick a category."); return; }
    setErr("");
    update((x) => ({ ...x, demo: false, nid: x.nid + 1, spend: [...x.spend, { id: x.nid, c: cid, a: n, n: note.trim(), d: new Date().toISOString().slice(0, 10) }] }));
    setA(""); setNote("");
  };

  const list = s.spend.filter((e) => e.d.slice(0, 7) === monthKey()).sort((x, y) => y.d.localeCompare(x.d) || y.id - x.id);

  return (
    <>
      <Card className="mb-3.5">
        <CardTitle>Add a spend or saving</CardTitle>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <Label htmlFor="ec" className="mt-0">Category</Label>
            <Select id="ec" value={cid} onChange={(e) => setCid(Number(e.target.value))}>
              {s.cats.map((c) => <option key={c.id} value={c.id}>{c.n}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="ea" className="mt-0">Amount (₹)</Label>
            <Input id="ea" type="number" inputMode="numeric" min={1} value={a} onChange={(e) => setA(e.target.value)} />
          </div>
        </div>
        <Label htmlFor="en">Note</Label>
        <Input id="en" maxLength={40} placeholder="Optional" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-red-600">{err}</span>
          <Button onClick={add}><Plus className="h-4 w-4" /> Add entry</Button>
        </div>
      </Card>

      <Card className="mb-3.5">
        <CardTitle>This month vs plan</CardTitle>
        {s.cats.length === 0 && <p className="text-sm text-stone-500">Add a category in Plan first.</p>}
        {s.cats.map((c) => {
          const b = amt(s, c), sp = spentOf(s, c), r = b ? sp / b : sp ? 2 : 0, sv = c.k === "save";
          const tone = sv ? "ok" : r > 1 ? "bad" : r >= 0.8 ? "warn" : "ok";
          const msg = sv ? (r >= 1 ? "Goal met" : `${inr(Math.max(0, b - sp))} still to save`)
            : r > 1 ? `Over by ${inr(sp - b)}` : r >= 0.8 ? `Nearly at limit, ${inr(b - sp)} left` : `${inr(b - sp)} left`;
          const text = { ok: "text-emerald-600", warn: "text-amber-600", bad: "text-red-600" }[tone];
          const fill = { ok: "bg-emerald-600", warn: "bg-amber-500", bad: "bg-red-600" }[tone];
          return (
            <div key={c.id} className="border-t border-stone-200 py-2.5 dark:border-stone-800">
              <div className="flex justify-between text-sm"><b>{c.n}</b><span>{inr(sp)} of {inr(b)}</span></div>
              <div className="my-1.5 h-2 overflow-hidden rounded bg-stone-200 dark:bg-stone-800">
                <div className={cn("h-full", fill)} style={{ width: `${Math.min(100, r * 100)}%` }} />
              </div>
              <small className={cn("text-xs", text)}>{msg}</small>
            </div>
          );
        })}
      </Card>

      <Card>
        <CardTitle>Entries</CardTitle>
        {list.length === 0 && <p className="text-sm text-stone-500">Nothing logged yet. Add your first entry above.</p>}
        {list.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-2 border-t border-stone-200 py-2 text-sm dark:border-stone-800">
            <div>{e.n || "Entry"}<div className="text-xs text-stone-500">{s.cats.find((c) => c.id === e.c)?.n ?? "Removed"} · {e.d}</div></div>
            <div className="flex items-center gap-1">
              <b>{inr(e.a)}</b>
              <Button variant="ghost" size="icon" aria-label="Delete entry" onClick={() => update((x) => ({ ...x, spend: x.spend.filter((k) => k.id !== e.id) }))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}
