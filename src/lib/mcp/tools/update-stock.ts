import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin } from "../supabase";

export default defineTool({
  name: "update_stock",
  title: "Update product stock",
  description: "Set the stock quantity of a product. Requires an admin account.",
  inputSchema: {
    product_id: z.string().describe("Product id (uuid)."),
    stock: z.number().int().describe("New stock quantity, zero or more."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ product_id, stock }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    if (stock < 0) return { content: [{ type: "text", text: "Stock cannot be negative" }], isError: true };
    const supabase = await requireAdmin(ctx);
    const { data, error } = await supabase
      .from("products")
      .update({ stock })
      .eq("id", product_id)
      .select("id, name, stock");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data?.length)
      return { content: [{ type: "text", text: "No product with that id" }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data[0]) }],
      structuredContent: { product: data[0] },
    };
  },
});
