import { createFileRoute } from "@tanstack/react-router";
import banner from "@/assets/banner.jpg.asset.json";
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
        content: "Why we cut everything the way it was cut in 1994.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <StoreLayout>
      <PageHeader title="Our story" subtitle="Vintage proportions, modern cotton, made in India." />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <img
          src={banner.url}
          alt="Vintage denim and graphic tees flat lay"
          loading="lazy"
          className="aspect-[16/9] w-full object-cover"
        />
        <div className="mt-10 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            90'S Clothing started with a single thrifted tee — 240 GSM, boxy through the chest,
            cropped just right. Nothing on the market fit like it, so we started making our own.
          </p>
          <p>
            Every piece is cut to genuine 90s proportions: dropped shoulders, wide legs, deep
            pockets. We print in small batches with water-based inks, wash our denim in Ahmedabad,
            and stitch everything with a double-needle finish so it survives a decade of wear.
          </p>
          <p>
            We ship across India with cash on delivery, because trust should go both ways. If a fit
            isn't right, send it back within 7 days — unworn with tags on — and we'll sort it.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { k: "240+", v: "GSM cotton on every tee" },
            { k: "12", v: "Pieces per drop, no more" },
            { k: "7-day", v: "No-questions returns" },
          ].map((stat) => (
            <div key={stat.k} className="border border-ink/15 bg-card p-5">
              <p className="text-3xl font-black">{stat.k}</p>
              <p className="micro-label mt-2 text-muted-foreground">{stat.v}</p>
            </div>
          ))}
        </div>
      </div>
    </StoreLayout>
  );
}
