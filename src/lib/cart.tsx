import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartLine = {
  product_id: string;
  name: string;
  image: string;
  price: number;
  size: string | null;
  color: string | null;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: CartLine) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "90s-clothing-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

export function lineKey(line: Pick<CartLine, "product_id" | "size" | "color">) {
  return `${line.product_id}|${line.size ?? ""}|${line.color ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore malformed cart */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      add: (line) =>
        setLines((prev) => {
          const key = lineKey(line);
          const existing = prev.find((l) => lineKey(l) === key);
          if (existing) {
            return prev.map((l) =>
              lineKey(l) === key ? { ...l, quantity: Math.min(10, l.quantity + line.quantity) } : l,
            );
          }
          return [...prev, line];
        }),
      setQuantity: (key, quantity) =>
        setLines((prev) =>
          prev.map((l) =>
            lineKey(l) === key ? { ...l, quantity: Math.max(1, Math.min(10, quantity)) } : l,
          ),
        ),
      remove: (key) => setLines((prev) => prev.filter((l) => lineKey(l) !== key)),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
