"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { makeDemo } from "./finance";
import type { State } from "./types";

const KEY = "lifebudget_v2";
export interface User { id: string; email: string }

/** State lives in browser storage; when Supabase is configured and the user is signed in, it syncs to the user_state table (RLS-protected). */
export function useBudget() {
  const [state, setState] = useState<State | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let local: State | null = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) local = JSON.parse(raw) as State;
    } catch { /* ignore corrupt storage */ }
    setState(local ?? makeDemo());

    if (!supabase) return;
    const sb = supabase;
    const load = async (u: { id: string; email?: string } | null) => {
      if (!u) { setUser(null); return; }
      const { data } = await sb.from("user_state").select("data").eq("user_id", u.id).maybeSingle();
      if (data?.data) setState(data.data as State);
      setUser({ id: u.id, email: u.email ?? "" });
    };
    sb.auth.getSession().then(({ data }) => load(data.session?.user ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, sess) => { void load(sess?.user ?? null); });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!state) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
    if (!supabase || !user) return;
    const sb = supabase;
    const t = setTimeout(() => {
      void sb.from("user_state").upsert({ user_id: user.id, data: state, updated_at: new Date().toISOString() });
    }, 800);
    return () => clearTimeout(t);
  }, [state, user]);

  const update = useCallback((f: (s: State) => State) => setState((p) => (p ? f(p) : p)), []);
  return { state, update, user };
}
