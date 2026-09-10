import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, PackageCheck, RotateCcw, Truck } from "lucide-react";
import hero from "@/assets/hero.jpg";
import banner from "@/assets/banner.jpg";
import { ProductCard } from "@/components/ProductCard";
import { StoreLayout } from "@/components/StoreLayout";
import { productsQuery } from "@/lib/queries";
import { CATEGORIES } from "@/lib/types";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  head: () => ({
    meta: [
      { title: "90'S CLOTHING — Vintage Streetwear Store" },
      {
        name: "description",
        content:
          "Shop 90s-cut streetwear: oversized tees, baggy jeans, cargo pants, hoodies and jackets. Cash on delivery across India.",
      },
      { property: "og:title", content: "90'S CLOTHING — Vintage Streetwear Store" },
      {
        property: "og:description",
        content: "Heavyweight cotton, boxy fits, real 90s proportions. Shop the drop.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const featured = products.slice(0, 8);

  return (
    <StoreLayout>
      <section className="grain relative isolate overflow-hidden bg-ink">
        <img
          src={hero}
          alt="Three friends in baggy jeans and oversized 90s streetwear on concrete steps"
          className="absolute inset-0 size-full object-cover opacity-65"
        />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6">
          <p className="micro-label rise text-paper/70">90S CLOTHING&nbsp; || MADE IN INDIA</p>
          <h1 className="rise mt-4 max-w-2xl text-4xl text-paper sm:text-5xl lg:text-6xl">
            TIMELESS STYLE FROM THE 90S
          </h1>
          <p className="rise mt-5 max-w-md text-sm text-paper/75 sm:text-base">

            Vintage streetwear. Premium quality. Made for those who never follow, they set the vibe.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="micro-label inline-flex items-center gap-2 bg-paper px-6 py-3.5 text-ink transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Shop the drop <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/about"
              className="micro-label inline-flex items-center gap-2 border border-paper/50 px-6 py-3.5 text-paper transition-colors hover:bg-paper/10"
            >
              Our story
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
          {[
            { icon: Truck, title: "Free shipping over ₹1999", copy: "3–6 day delivery, pan-India" },
            { icon: PackageCheck, title: "Cash on delivery", copy: "Pay when the parcel lands" },
            { icon: RotateCcw, title: "7-day easy returns", copy: "Unworn, tags on, no drama" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <item.icon className="mt-0.5 size-5 text-accent" />
              <div>
                <p className="text-sm font-bold uppercase tracking-wide">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl sm:text-4xl">Shop by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              to="/shop"
              search={{ category }}
              className="micro-label flex items-center justify-center border border-ink/25 px-3 py-6 text-center transition-colors hover:bg-ink hover:text-paper"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl">Featured fits</h2>
          <Link to="/shop" className="micro-label whitespace-nowrap hover:text-accent">
            View all →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="grain relative isolate mx-auto max-w-7xl overflow-hidden px-4 sm:px-6">
        <div className="relative isolate overflow-hidden bg-ink">
          <img
            src={banner}
            alt="Vintage denim and graphic tees flat lay"
            loading="lazy"
            className="absolute inset-0 size-full object-cover opacity-55"
          />
          <div className="relative px-6 py-20 text-center sm:py-24">
            <p className="micro-label text-paper/70">Limited run</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-4xl text-paper sm:text-5xl">
              Restocked: the baggy denim archive
            </h2>
            <Link
              to="/shop"
              search={{ category: "Baggy Jeans" }}
              className="micro-label mt-8 inline-flex bg-accent px-6 py-3.5 text-accent-foreground transition-opacity hover:opacity-90"
            >
              Shop denim
            </Link>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
