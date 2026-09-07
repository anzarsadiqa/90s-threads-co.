import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { StoreLayout } from "@/components/StoreLayout";
import { supabase } from "@/integrations/supabase/client";

type OAuthDetails = {
  client?: { name?: string } | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: OAuthDetails | null; error: Error | null }>;
  approveAuthorization: (id: string) => Promise<{ data: OAuthDetails | null; error: Error | null }>;
  denyAuthorization: (id: string) => Promise<{ data: OAuthDetails | null; error: Error | null }>;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s['authorization_id'] === "string" ? s['authorization_id'] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/auth", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <StoreLayout>
      <main className="mx-auto max-w-md px-4 py-20">
        <p className="text-sm text-muted-foreground">
          Could not load this authorization request: {String((error as Error)?.message ?? error)}
        </p>
      </main>
    </StoreLayout>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "an app";

  async function decide(approve: boolean) {
    setBusy(true);
    const api = oauthApi();
    const { data, error: err } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <StoreLayout>
      <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
        <div className="border border-ink/15 bg-card p-8">
          <BrandLogo className="mx-auto h-10" />
          <h1 className="mt-6 text-center text-2xl">Connect {clientName}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This lets {clientName} use the 90'S CLOTHING store as you — browsing products, and, if
            your account is a store admin, viewing and updating orders and stock.
          </p>
          {error && (
            <p role="alert" className="mt-4 text-sm text-accent">
              {error}
            </p>
          )}
          <div className="mt-8 space-y-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => decide(true)}
              className="micro-label w-full bg-ink py-4 text-paper transition-colors hover:bg-accent disabled:opacity-50"
            >
              {busy ? "Please wait…" : "Approve"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => decide(false)}
              className="micro-label w-full border border-ink/25 py-4 transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
            >
              Deny
            </button>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
