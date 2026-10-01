import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...i: ClassValue[]) => twMerge(clsx(i));

export const inr = (n: number) =>
  (n < 0 ? "-" : "") + "₹" + Math.round(Math.abs(n)).toLocaleString("en-IN");
