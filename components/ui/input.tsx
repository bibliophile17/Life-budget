import * as React from "react";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-emerald-500 dark:border-stone-700 dark:bg-stone-950";

export function Input({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(field, className)} {...p} />;
}

export function Select({ className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(field, className)} {...p} />;
}

export function Label({ className, ...p }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1 mt-3 block text-xs font-semibold text-stone-500 dark:text-stone-400", className)} {...p} />;
}
