import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — 90'S CLOTHING" },
      {
        name: "description",
        content:
          "90'S Clothing makes heavyweight, vintage-cut streetwear in India — boxy tees, baggy denim and cargos built to last.",
      },
      { property: "og:title", content: "About Us — 90'S CLOTHING" },
      {
        property: "og:description",
        content: "90s and vintage streetwear with premium quality at affordable prices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <StoreLayout>
      <PageHeader title="About us" subtitle="90s and vintage streetwear." />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          90s Clothing offers 90s and vintage streetwear with premium quality at affordable prices.
        </p>
      </div>
    </StoreLayout>
  );
}
