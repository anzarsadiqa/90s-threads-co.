import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";
import { productsQuery } from "@/lib/queries";
import { CATEGORIES, effectivePrice } from "@/lib/types";

type ShopSearch = { q?: string | undefined; category?: string | undefined };

const SORTS = [
  { id: "new", label: "Newest" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
] as const;

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    const rawQ = search["q"];
    const rawCategory = search["category"];
    return {
      q: typeof rawQ === "string" && rawQ ? rawQ.slice(0, 80) : undefined,
      category:
        typeof rawCategory === "string" && rawCategory ? rawCategory.slice(0, 60) : undefined,
    };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),

  head: () => ({
    meta: [
      { title: "Shop All — 90'S CLOTHING" },
      {
        name: "description",
        content:
          "Browse every 90s fit: oversized tees, graphic tees, baggy jeans, cargo pants, hoodies and jackets.",
      },
      { property: "og:title", content: "Shop All — 90'S CLOTHING" },
      {
        property: "og:description",
        content: "Filter by category, size and price. Free shipping over ₹1999.",
      },
    ],
  }),
  component: ShopPage,
  errorComponent: () => (
    <StoreLayout>
      <PageHeader title="Shop" subtitle="We couldn't load products just now. Please refresh." />
    </StoreLayout>
  ),
});

function ShopPage() {
  const { q, category } = Route.useSearch();
  const { data: products } = useSuspenseQuery(productsQuery);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("new");
  const [size, setSize] = useState<string | null>(null);

  const allSizes = useMemo(
    () => [...new Set(products.flatMap((p) => p.sizes))],
    [products],
  );

  const visible = useMemo(() => {
    const term = q?.toLowerCase().trim();
    let list = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (size && !p.sizes.includes(size)) return false;
      if (term && !`${p.name} ${p.description} ${p.category}`.toLowerCase().includes(term))
        return false;
      return true;
    });
    if (sort === "low") list = [...list].sort((a, b) => effectivePrice(a) - effectivePrice(b));
    if (sort === "high") list = [...list].sort((a, b) => effectivePrice(b) - effectivePrice(a));
    return list;
  }, [products, category, size, q, sort]);

  return (
    <StoreLayout>
      <PageHeader
        title={category ?? (q ? `Search: ${q}` : "Shop all")}
        subtitle={`${visible.length} product${visible.length === 1 ? "" : "s"} available`}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 pb-6">
          <Link
            to="/shop"
            search={q ? { q } : {}}
            className={`micro-label border px-3 py-2 ${
              category ? "border-ink/25 hover:bg-ink hover:text-paper" : "border-ink bg-ink text-paper"
            }`}
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/shop"
              search={q ? { q, category: c } : { category: c }}
              className={`micro-label border px-3 py-2 ${
                category === c
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/25 hover:bg-ink hover:text-paper"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="micro-label text-muted-foreground">Size</span>
            <button
              type="button"
              onClick={() => setSize(null)}
              className={`micro-label border px-3 py-1.5 ${size ? "border-ink/25" : "border-ink bg-ink text-paper"}`}
            >
              Any
            </button>
            {allSizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`micro-label border px-3 py-1.5 ${
                  size === s ? "border-ink bg-ink text-paper" : "border-ink/25"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <label className="micro-label flex items-center gap-2">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="micro-label border border-ink/25 bg-transparent px-3 py-2"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {visible.length === 0 ? (
          <p className="py-24 text-center text-sm text-muted-foreground">
            No products match those filters yet.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
