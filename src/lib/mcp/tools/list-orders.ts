import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin } from "../supabase";

export default defineTool({
  name: "list_orders",
  title: "List orders",
  description:
    "List customer orders with items, totals and status, newest first. Requires an admin account.",
  inputSchema: {
    status: z
      .string()
      .optional()
      .describe("Filter by status: Pending, Confirmed, Shipped, Delivered or Cancelled."),
    order_number: z.string().optional().describe("Look up a single order by its order number."),
    limit: z.number().int().optional().describe("Maximum orders to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, order_number, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = await requireAdmin(ctx);
    let query = supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, phone, email, address, city, state, pincode, total_amount, payment_method, status, created_at, order_items(id, product_name, quantity, size, color, price)",
      )
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 20, 1), 100));
    if (status) query = query.eq("status", status);
    if (order_number) query = query.eq("order_number", order_number);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { orders: data ?? [] },
    };
  },
});
