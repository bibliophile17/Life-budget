"use client";

import { useState } from "react";
import { LogOut, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/lib/use-budget";

export function AuthButton({ user }: { user: User | null }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  if (!supabase) return <span className="text-xs text-stone-500">Local mode</span>;
  const sb = supabase;

  if (user)
    return (
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <span className="hidden sm:inline">{user.email}</span>
        <Button variant="outline" size="sm" onClick={() => void sb.auth.signOut()}>
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </Button>
      </div>
    );

  const send = async () => {
    if (!email.includes("@")) { setMsg("Enter a valid email."); return; }
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setMsg(error ? error.message : "Check your email for the sign-in link.");
  };

  return (
    <div className="flex items-center gap-2">
      <Input className="h-8 w-40 text-xs" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
      <Button size="sm" onClick={send}><Mail className="h-3.5 w-3.5" /> Sync</Button>
      {msg && <span className="text-xs text-stone-500">{msg}</span>}
    </div>
  );
}
