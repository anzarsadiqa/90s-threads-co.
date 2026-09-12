import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";
import { StoreLayout } from "@/components/StoreLayout";
import { useCart } from "@/lib/cart";
import { productQuery, productsQuery } from "@/lib/queries";
import { effectivePrice, formatINR } from "@/lib/types";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productQuery(params.id));
    if (!product) throw notFound();
    await context.queryClient.ensureQueryData(productsQuery);
    return { name: product.name, description: product.description, image: product.images[0] };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product unavailable — 90'S CLOTHING" }, { name: "robots", content: "noindex" }],
      };
    }
    const desc = loaderData.description.slice(0, 155);
    return {
      meta: [
        { title: `${loaderData.name} — 90'S CLOTHING` },
        { name: "description", content: desc },
        { property: "og:title", content: `${loaderData.name} — 90'S CLOTHING` },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <StoreLayout>
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <h1 className="text-4xl">Product not found</h1>
        <Link to="/shop" className="micro-label mt-6 inline-block bg-ink px-6 py-3 text-paper">
          Back to shop
        </Link>
      </div>
    </StoreLayout>
  ),
  errorComponent: () => (
    <StoreLayout>
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <h1 className="text-3xl">This product didn't load</h1>
        <Link to="/shop" className="micro-label mt-6 inline-block bg-ink px-6 py-3 text-paper">
          Back to shop
        </Link>
      </div>
    </StoreLayout>
  ),
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(id));
  const { data: all } = useSuspenseQuery(productsQuery);
  const cart = useCart();
  const navigate = useNavigate();

  const [image, setImage] = useState(0);
  const [size, setSize] = useState<string | null>(product?.sizes[0] ?? null);
  const [color, setColor] = useState<string | null>(product?.colors[0] ?? null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!product) return;
    setImage(0);
    setSize(product.sizes[0] ?? null);
    setColor(product.colors[0] ?? null);
    setQty(1);
  }, [product]);

  if (!product) return null;
  const price = effectivePrice(product);
  const onSale = product.discount_price != null && product.discount_price < product.price;
  const related = all.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  function addToCart() {
    if (product.stock <= 0) return;
    cart.add({
      product_id: product.id,
      name: product.name,
      image: product.images[image] ?? product.images[0] ?? "",
      price,
      size,
      color,
      quantity: qty,
    });
    toast.success("Added to cart", {
      description: `${product.name}${color ? ` · ${color}` : ""} × ${qty}`,
    });
  }

  function selectColor(nextColor: string, colorIndex: number) {
    setColor(nextColor);
    if (product.images.length === product.colors.length && product.images[colorIndex]) {
      setImage(colorIndex);
    }
  }

  function selectImage(imageIndex: number) {
    setImage(imageIndex);
    if (product.images.length === product.colors.length && product.colors[imageIndex]) {
      setColor(product.colors[imageIndex]);
    }
  }

  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <nav className="micro-label mb-8 text-muted-foreground">
          <Link to="/" className="hover:text-accent">
            Home
          </Link>
          {" / "}
          <Link to="/shop" search={{ category: product.category }} className="hover:text-accent">
            {product.category}
          </Link>
          {" / "}
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="bg-muted">
              <img
                src={product.images[image] ?? product.images[0]}
                alt={product.name}
                width={1024}
                height={1280}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {product.images.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => selectImage(index)}
                    aria-label={`View image ${index + 1}${product.colors[index] ? `, ${product.colors[index]}` : ""}`}
                    aria-pressed={index === image}
                    className={`size-20 overflow-hidden border ${
                      index === image ? "border-ink" : "border-transparent"
                    }`}
                  >
                    <img src={src} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="micro-label text-muted-foreground">{product.category}</p>
            <h1 className="mt-2 text-4xl sm:text-5xl">{product.name}</h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-bold">{formatINR(price)}</span>
              {onSale && (
                <span className="text-base text-muted-foreground line-through">
                  {formatINR(product.price)}
                </span>
              )}
            </div>
            <p className="micro-label mt-1 text-muted-foreground">Inclusive of all taxes</p>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {product.sizes.length > 0 && (
              <div className="mt-8">
                <p className="micro-label mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`micro-label border px-4 py-2.5 ${
                        size === s ? "border-ink bg-ink text-paper" : "border-ink/25"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors.length > 0 && (
              <div className="mt-6">
                <p className="micro-label mb-2">Colour</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c, colorIndex) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => selectColor(c, colorIndex)}
                      aria-pressed={color === c}
                      className={`micro-label border px-4 py-2.5 ${
                        color === c
                          ? "border-ink bg-ink text-paper"
                          : "border-ink/25 hover:border-ink"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <p className="micro-label">Qty</p>
              <div className="flex items-center border border-ink/25">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((v) => Math.max(1, v - 1))}
                  className="px-3 py-2.5"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((v) => Math.min(10, v + 1))}
                  className="px-3 py-2.5"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <span className="micro-label text-muted-foreground">
                {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={addToCart}
                disabled={product.stock <= 0}
                className="micro-label flex-1 bg-ink py-4 text-paper transition-colors hover:bg-accent disabled:opacity-40"
              >
                Add to cart
              </button>
              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={() => {
                  addToCart();
                  navigate({ to: "/checkout" });
                }}
                className="micro-label flex-1 border border-ink py-4 transition-colors hover:bg-ink hover:text-paper disabled:opacity-40"
              >
                Buy now
              </button>
            </div>

            <div className="mt-8 space-y-3 border-t border-ink/10 pt-6 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Truck className="size-4 text-accent" /> Free shipping over ₹1999 · 3–6 days
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-accent" /> 7-day returns · Cash on delivery
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-3xl">You may also like</h2>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </StoreLayout>
  );
}
