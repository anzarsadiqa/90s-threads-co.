import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProducts from "./tools/list-products";
import updateStock from "./tools/update-stock";
import listOrders from "./tools/list-orders";
import updateOrderStatus from "./tools/update-order-status";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "90-s-threads-co",
  title: "90's Threads Co.",
  version: "0.1.0",
  instructions:
    "Tools for the 90'S CLOTHING store. Use `list_products` to browse the catalogue. Store admins can also use `list_orders`, `update_order_status` and `update_stock`.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProducts, listOrders, updateOrderStatus, updateStock],
});
