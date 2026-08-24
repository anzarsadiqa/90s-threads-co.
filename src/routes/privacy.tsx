import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — 90'S CLOTHING" },
      {
        name: "description",
        content: "How 90'S Clothing collects, uses and protects your personal information.",
      },
      { property: "og:title", content: "Privacy Policy — 90'S CLOTHING" },
      { property: "og:description", content: "What we collect and how we handle your data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <StoreLayout>
      <PageHeader title="Privacy policy" subtitle="Last updated: January 2026" />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6">
        <section>
          <h2 className="mb-3 text-xl text-foreground">What we collect</h2>
          <p>
            When you place an order we collect your name, phone number, email address and delivery
            address. We do not collect card details — orders are cash on delivery.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl text-foreground">How we use it</h2>
          <p>
            Purely to process, pack and deliver your order, and to contact you about that order. We
            never sell your information to third parties.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl text-foreground">Who we share it with</h2>
          <p>
            Only our delivery partners, and only the details needed to get your parcel to your door.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl text-foreground">Your choices</h2>
          <p>
            Write to hello@90sclothing.in any time to access, correct or delete the information we
            hold about you.
          </p>
        </section>
      </div>
    </StoreLayout>
  );
}
