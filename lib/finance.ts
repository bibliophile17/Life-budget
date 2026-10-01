import type { Category, Kind, State } from "./types";
import { inr } from "./utils";

const iso = () => new Date().toISOString().slice(0, 10);
export const monthKey = () => iso().slice(0, 7);

export const makeDemo = (): State => {
  const d = iso();
  return {
    salary: 80000, growth: 5, ret: 8, extra: 2000, demo: true, nid: 50,
    cats: [
      { id: 1, n: "Essentials", k: "need", p: 32 },
      { id: 2, n: "Savings", k: "save", p: 20 },
      { id: 3, n: "Investments", k: "save", p: 15 },
      { id: 4, n: "Travel", k: "want", p: 10 },
      { id: 5, n: "Fun & friends", k: "want", p: 8 },
      { id: 6, n: "Shopping", k: "want", p: 5 },
      { id: 7, n: "Buffer", k: "save", p: 10 },
    ],
    spend: [
      { id: 11, c: 1, a: 15000, n: "Rent", d },
      { id: 12, c: 1, a: 7000, n: "Food & groceries", d },
      { id: 13, c: 1, a: 3000, n: "Transport", d },
      { id: 14, c: 5, a: 2200, n: "Dinner with friends", d },
      { id: 15, c: 4, a: 3500, n: "Goa trip fund", d },
      { id: 16, c: 2, a: 15000, n: "Monthly savings", d },
    ],
  };
};

export const amt = (s: State, c: Category) => ((s.salary || 0) * c.p) / 100;
export const spentOf = (s: State, c: Category) =>
  s.spend.filter((e) => e.c === c.id && e.d.slice(0, 7) === monthKey()).reduce((a, e) => a + e.a, 0);
export const sumKind = (s: State, k?: Kind) =>
  s.cats.filter((c) => !k || c.k === k).reduce((a, c) => a + amt(s, c), 0);
export const totalPct = (s: State) => s.cats.reduce((a, c) => a + c.p, 0);
export const round1 = (n: number) => Math.round(n * 10) / 10;
export const clampPct = (n: number) => Math.min(100, Math.max(0, n));

export const catColor = (c: Category, i: number) =>
  `hsl(${c.k === "need" ? 212 : c.k === "save" ? 160 : 28} 58% ${38 + (i % 4) * 9}%)`;

export function applyPreset(cats: Category[], need: number, want: number, save: number): Category[] {
  const target: Record<Kind, number> = { need, want, save };
  return cats.map((c) => {
    const group = cats.filter((x) => x.k === c.k);
    const cur = group.reduce((a, x) => a + x.p, 0);
    return { ...c, p: round1(cur ? (c.p / cur) * target[c.k] : target[c.k] / group.length) };
  });
}

/** Cut wants by 30% and move the freed share into investments (or first saving category). */
export function squeeze(cats: Category[]): Category[] {
  let freed = 0;
  const cut = cats.map((c) => {
    if (c.k !== "want") return c;
    const p = round1(c.p * 0.7);
    freed += c.p - p;
    return { ...c, p };
  });
  const target = cut.find((c) => c.k === "save" && /invest/i.test(c.n)) ?? cut.find((c) => c.k === "save");
  return cut.map((c) => (c === target ? { ...c, p: round1(c.p + freed) } : c));
}

export function moveToSavings(cats: Category[]): Category[] {
  const gap = 100 - cats.reduce((a, c) => a + c.p, 0);
  const t = cats.find((c) => c.k === "save");
  return cats.map((c) => (c === t ? { ...c, p: round1(c.p + gap) } : c));
}

export function autoFix(cats: Category[]): Category[] {
  const total = cats.reduce((a, c) => a + c.p, 0);
  const wants = cats.filter((c) => c.k === "want").reduce((a, c) => a + c.p, 0);
  const cut = Math.min(total - 100, wants);
  let out = cats.map((c) => (c.k === "want" && wants ? { ...c, p: round1((c.p * (wants - cut)) / wants) } : c));
  const t2 = out.reduce((a, c) => a + c.p, 0);
  if (t2 > 100.05) out = out.map((c) => ({ ...c, p: round1((c.p * 100) / t2) }));
  return out;
}

export function briefing(s: State): string {
  const sv = sumKind(s, "save"), need = sumKind(s, "need"), want = sumKind(s, "want");
  const r = s.salary ? sv / s.salary : 0;
  const tag = r < 0.1 ? "That is thin. Moving 5% from wants builds a real cushion."
    : r < 0.2 ? "A healthy start." : r < 0.3 ? "Strong savings rate."
    : "Aggressive saver. Make sure you still enjoy the month.";
  const top = [...s.cats].filter((c) => c.k === "want").sort((a, b) => b.p - a.p)[0];
  const target = 6 * need;
  return (
    `Of ${inr(s.salary)}, you keep ${inr(sv)} (${Math.round(r * 100)}%), spend ${inr(need)} on needs and ${inr(want)} on wants. ${tag} That is ${inr(sv * 12)} a year.` +
    (top ? ` Biggest want: ${top.n} at ${inr(amt(s, top))}.` : "") +
    (sv > 0 && target > 0 ? ` A 6-month essentials cushion is ${inr(target)}, about ${Math.ceil(target / sv)} months of saving.` : "")
  );
}

export function checkAfford(s: State, catId: number, a: number) {
  const c = s.cats.find((x) => x.id === catId);
  if (!c || !(a > 0)) return null;
  const rem = amt(s, c) - spentOf(s, c);
  const after = rem - a;
  const buf = s.cats.filter((x) => /buffer/i.test(x.n)).reduce((t, x) => t + Math.max(0, amt(s, x) - spentOf(s, x)), 0);
  const sv = sumKind(s, "save");
  let level: "ok" | "warn" | "bad" = "ok";
  let title = "Fits your plan";
  let msg = `${c.n} would have ${inr(after)} left this month.`;
  if (after < 0) {
    const need = -after;
    if (need <= buf) {
      level = "warn"; title = "Tight, uses your buffer";
      msg = `${c.n} is ${inr(need)} over. Your buffer covers it, leaving ${inr(buf - need)}.`;
    } else {
      level = "bad"; title = "Eats into savings";
      const sh = need - buf;
      msg = `${c.n} is ${inr(need)} over and the buffer can't cover it. About ${inr(sh)} would come out of savings (${sv ? Math.round((sh / sv) * 100) : 0}% of this month's saving).`;
    }
  }
  return { level, title, msg, rem, buf, name: c.n, fv: a * Math.pow(1 + s.ret / 100, 5) };
}

export interface SimPoint { year: number; value: number; invested: number }

export function simulate(monthly: number, growth: number, ret: number): SimPoint[] {
  const r = ret / 1200;
  let b = 0, c = 0;
  const out: SimPoint[] = [{ year: 0, value: 0, invested: 0 }];
  for (let m = 0; m < 120; m++) {
    const k = monthly * Math.pow(1 + growth / 100, Math.floor(m / 12));
    b = b * (1 + r) + k;
    c += k;
    if ((m + 1) % 12 === 0) out.push({ year: (m + 1) / 12, value: Math.round(b), invested: Math.round(c) });
  }
  return out;
}
