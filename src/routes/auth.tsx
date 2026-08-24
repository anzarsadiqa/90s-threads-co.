import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/BrandLogo";
import { StoreLayout } from "@/components/StoreLayout";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Store Login — 90'S CLOTHING" },
      { name: "description", content: "Sign in to manage the 90'S Clothing store." },
      { property: "og:title", content: "Store Login — 90'S CLOTHING" },
      { property: "og:description", content: "Admin access for the 90'S Clothing store." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/admin", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/auth" },
        });
        if (error) throw error;
        if (!data.session) setNotice("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin", replace: true });
  }

  return (
    <StoreLayout>
      <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
        <div className="border border-ink/15 bg-card p-8">
          <BrandLogo className="mx-auto h-10" />
          <h1 className="mt-6 text-center text-3xl">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="micro-label mt-2 text-center text-muted-foreground">Store admin access</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span className="micro-label">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border border-ink/25 bg-background px-3 py-3 text-sm outline-none focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="micro-label">Password</span>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border border-ink/25 bg-background px-3 py-3 text-sm outline-none focus:border-accent"
              />
            </label>
            {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
            <button
              type="submit"
              disabled={busy}
              className="micro-label w-full bg-ink py-4 text-paper transition-colors hover:bg-accent disabled:opacity-50"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
            </button>
          </form>

          <button
            type="button"
            onClick={google}
            className="micro-label mt-3 w-full border border-ink/25 py-4 transition-colors hover:bg-ink hover:text-paper"
          >
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="micro-label mt-6 w-full text-muted-foreground hover:text-accent"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </StoreLayout>
  );
}
