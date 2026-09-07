import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin } from "../supabase";
import { ORDER_STATUSES } from "@/lib/types";

export default defineTool({
  name: "update_order_status",
  title: "Update order status",
  description:
    "Change an order's status to Pending, Confirmed, Shipped, Delivered or Cancelled. Requires an admin account.",
  inputSchema: {
    order_number: z.string().describe("The order number, e.g. 90S-ABC123."),
    status: z.string().describe("New status: Pending, Confirmed, Shipped, Delivered or Cancelled."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ order_number, status }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
      return {
        content: [{ type: "text", text: `Status must be one of: ${ORDER_STATUSES.join(", ")}` }],
        isError: true,
      };
    }
    const supabase = await requireAdmin(ctx);
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("order_number", order_number)
      .select("id, order_number, status");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data?.length)
      return { content: [{ type: "text", text: "No order with that order number" }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data[0]) }],
      structuredContent: { order: data[0] },
    };
  },
});
