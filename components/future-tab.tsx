"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { State } from "@/lib/types";
import { simulate, sumKind } from "@/lib/finance";
import { inr } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

interface Props { s: State; update: (f: (s: State) => State) => void }

export function FutureTab({ s, update }: Props) {
  const base = sumKind(s, "save");
  const A = simulate(base + s.extra, s.growth, s.ret);
  const B = simulate(base, s.growth, s.ret);
  const set = (k: "growth" | "ret" | "extra") => (e: React.ChangeEvent<HTMLInputElement>) =>
    update((x) => ({ ...x, [k]: Math.max(0, Number(e.target.value) || 0) }));

  return (
    <Card>
      <CardTitle>Future simulator</CardTitle>
      <div className="grid grid-cols-3 gap-2.5">
        <div><Label htmlFor="fg" className="mt-0">Salary growth %/yr</Label><Input id="fg" type="number" step={0.5} min={0} value={s.growth} onChange={set("growth")} /></div>
        <div><Label htmlFor="fr" className="mt-0">Assumed return %/yr</Label><Input id="fr" type="number" step={0.5} min={0} value={s.ret} onChange={set("ret")} /></div>
        <div><Label htmlFor="fx" className="mt-0">Extra saving ₹/mo</Label><Input id="fx" type="number" step={500} min={0} value={s.extra} onChange={set("extra")} /></div>
      </div>

      <p className="mt-3 text-sm text-stone-500">
        Saving {inr(base + s.extra)} a month ({inr(base)} from your plan + {inr(s.extra)} extra), with {s.growth}% yearly salary growth.
      </p>

      <table className="mt-3 w-full text-sm">
        <thead><tr className="text-xs text-stone-500"><th className="py-2 text-left font-semibold">After</th><th className="text-right font-semibold">You put in</th><th className="text-right font-semibold">Hypothetical value</th></tr></thead>
        <tbody>
          {[1, 3, 5, 10].map((y) => (
            <tr key={y} className="border-t border-stone-200 dark:border-stone-800">
              <td className="py-2">{y} yr{y > 1 ? "s" : ""}</td>
              <td className="text-right">{inr(A[y].invested)}</td>
              <td className="text-right font-bold">{inr(A[y].value)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 h-56" aria-label="Projection over 10 years">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={A} margin={{ left: 0, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis dataKey="year" tickFormatter={(v) => `${v}y`} fontSize={12} />
            <YAxis tickFormatter={(v) => (v >= 100000 ? `${Math.round(v / 1000) / 100}L` : `${Math.round(v / 1000)}k`)} fontSize={12} width={44} />
            <Tooltip formatter={(v) => inr(Number(v))} labelFormatter={(l) => `Year ${l}`} />
            <Legend />
            <Line type="monotone" dataKey="value" name="Hypothetical value" stroke="#059669" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="invested" name="You put in" stroke="#78716c" strokeDasharray="4 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 rounded-lg border-l-4 border-emerald-600 bg-emerald-50 p-3.5 text-sm dark:bg-emerald-950">
        <b className="block text-base">Your extra {inr(s.extra)}/month</b>
        Adds about {inr(A[5].value - B[5].value)} in 5 years and {inr(A[10].value - B[10].value)} in 10 years under these assumptions.
      </div>
      <p className="mt-3 text-xs text-stone-500">Hypothetical projections based on the assumptions you enter. They are not guarantees, forecasts or financial advice.</p>
    </Card>
  );
}
