import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List store products with price, discount price, category, sizes, colors and stock. Optionally filter by category or search text.",
  inputSchema: {
    search: z.string().optional().describe("Text to match against product name."),
    category: z.string().optional().describe("Exact category name to filter by."),
    limit: z.number().int().optional().describe("Maximum rows to return (default 25, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, category, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const take = Math.min(Math.max(limit ?? 25, 1), 100);
    let query = supabaseForUser(ctx)
      .from("products")
      .select(
        "id, name, price, discount_price, category, sizes, colors, stock, description, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(take);
    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("name", `%${search}%`);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
