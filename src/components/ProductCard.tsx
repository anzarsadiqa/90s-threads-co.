import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { effectivePrice, formatINR, type Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const price = effectivePrice(product);
  const onSale = product.discount_price != null && product.discount_price < product.price;
  const off = onSale ? Math.round((1 - price / product.price) * 100) : 0;

  function quickAdd() {
    if (product.stock <= 0) return;
    cart.add({
      product_id: product.id,
      name: product.name,
      image: product.images[0] ?? "",
      price,
      size: product.sizes[0] ?? null,
      color: product.colors[0] ?? null,
      quantity: 1,
    });
    toast.success("Added to cart", {
      description: `${product.name}${product.sizes[0] ? ` · Size ${product.sizes[0]}` : ""}`,
    });
  }

  return (
    <div className="group">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block overflow-hidden bg-muted"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1280}
          className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {onSale && (
          <span className="micro-label absolute left-0 top-3 bg-accent px-2 py-1 text-accent-foreground">
            {off}% off
          </span>
        )}
        {product.stock <= 0 && (
          <span className="micro-label absolute inset-x-0 bottom-0 bg-ink/85 py-2 text-center text-paper">
            Sold out
          </span>
        )}
      </Link>

      <div className="mt-3 space-y-1">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="block text-sm font-semibold uppercase tracking-wide hover:text-accent"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold">{formatINR(price)}</span>
          {onSale && (
            <span className="text-xs text-muted-foreground line-through">
              {formatINR(product.price)}
            </span>
          )}
        </div>
        <p className="micro-label text-muted-foreground">{product.sizes.join(" · ")}</p>
        <button
          type="button"
          onClick={quickAdd}
          disabled={product.stock <= 0}
          className="micro-label mt-2 w-full border border-ink/70 py-2 transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
        >
          {product.stock <= 0 ? "Sold out" : "Quick add"}
        </button>
      </div>
    </div>
  );
}
