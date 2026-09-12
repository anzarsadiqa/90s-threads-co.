import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const webhookSchema = z
  .object({
    shipment_id: z.union([z.string(), z.number()]).optional(),
    shipmentId: z.union([z.string(), z.number()]).optional(),
    awb: z.union([z.string(), z.number()]).optional(),
    awb_code: z.union([z.string(), z.number()]).optional(),
    current_status: z.string().max(120).optional(),
    status: z.string().max(120).optional(),
    shipment_status: z.string().max(120).optional(),
    courier_name: z.string().max(120).optional(),
    courier: z.string().max(120).optional(),
    track_url: z.string().url().max(1000).optional(),
    tracking_url: z.string().url().max(1000).optional(),
  })
  .passthrough();

export const Route = createFileRoute("/api/public/shiprocket-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["SHIPROCKET_WEBHOOK_SECRET"];
        const received = request.headers.get("x-api-key");
        if (!expected || !received || received !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        const parsed = webhookSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Invalid payload." }, { status: 400 });
        const payload = parsed.data;
        const shipmentId = String(payload.shipment_id || payload.shipmentId || "");
        const awb = String(payload.awb || payload.awb_code || "");
        if (!shipmentId && !awb) {
          return Response.json({ error: "Shipment ID or AWB is required." }, { status: 400 });
        }

        const updates: {
          shiprocket_awb?: string;
          shiprocket_courier?: string;
          shiprocket_tracking_status?: string;
          shiprocket_tracking_url?: string;
          shiprocket_updated_at: string;
        } = {
          shiprocket_updated_at: new Date().toISOString(),
        };
        if (awb) updates.shiprocket_awb = awb;
        if (payload.courier_name || payload.courier) updates.shiprocket_courier = payload.courier_name || payload.courier;
        if (payload.current_status || payload.status || payload.shipment_status) {
          updates.shiprocket_tracking_status = payload.current_status || payload.status || payload.shipment_status;
        }
        if (payload.track_url || payload.tracking_url) updates.shiprocket_tracking_url = payload.track_url || payload.tracking_url;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        let query = supabaseAdmin.from("orders").update(updates);
        query = shipmentId
          ? query.eq("shiprocket_shipment_id", shipmentId)
          : query.eq("shiprocket_awb", awb);
        const { data, error } = await query.select("id");
        if (error) return Response.json({ error: "Could not update tracking." }, { status: 500 });
        return Response.json({ ok: true, updated: data?.length || 0 });
      },
    },
  },
});