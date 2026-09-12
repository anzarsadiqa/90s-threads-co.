ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS weight_kg numeric NOT NULL DEFAULT 0.5;

UPDATE public.products
SET sku = '90S-' || upper(substr(replace(id::text, '-', ''), 1, 12))
WHERE sku IS NULL OR btrim(sku) = '';

ALTER TABLE public.products
  ALTER COLUMN sku SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS products_sku_key ON public.products (sku);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shiprocket_sync_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS shiprocket_order_id text,
  ADD COLUMN IF NOT EXISTS shiprocket_shipment_id text,
  ADD COLUMN IF NOT EXISTS shiprocket_awb text,
  ADD COLUMN IF NOT EXISTS shiprocket_courier text,
  ADD COLUMN IF NOT EXISTS shiprocket_tracking_url text,
  ADD COLUMN IF NOT EXISTS shiprocket_tracking_status text,
  ADD COLUMN IF NOT EXISTS shiprocket_error text,
  ADD COLUMN IF NOT EXISTS shiprocket_retry_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shiprocket_last_attempt_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS shiprocket_synced_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS shiprocket_updated_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS orders_shiprocket_sync_status_idx
  ON public.orders (shiprocket_sync_status, created_at DESC);

CREATE TABLE public.shipping_settings (
  id boolean PRIMARY KEY DEFAULT true,
  pickup_location text NOT NULL,
  package_length_cm numeric NOT NULL,
  package_breadth_cm numeric NOT NULL,
  package_height_cm numeric NOT NULL,
  default_weight_kg numeric NOT NULL DEFAULT 0.5,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT shipping_settings_singleton CHECK (id = true),
  CONSTRAINT shipping_settings_positive_dimensions CHECK (
    package_length_cm > 0.5 AND package_breadth_cm > 0.5 AND package_height_cm > 0.5
  ),
  CONSTRAINT shipping_settings_positive_weight CHECK (default_weight_kg > 0)
);

GRANT SELECT, UPDATE ON public.shipping_settings TO authenticated;
GRANT ALL ON public.shipping_settings TO service_role;
ALTER TABLE public.shipping_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view shipping settings"
ON public.shipping_settings FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can update shipping settings"
ON public.shipping_settings FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.shipping_settings (
  id,
  pickup_location,
  package_length_cm,
  package_breadth_cm,
  package_height_cm,
  default_weight_kg
) VALUES (
  true,
  'Nintees clothing,Ibrahimpura,nasheman building shop no-1 Madhya Pradesh-462001',
  16,
  15,
  10,
  0.5
);

CREATE OR REPLACE FUNCTION public.set_shipping_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER shipping_settings_updated_at
BEFORE UPDATE ON public.shipping_settings
FOR EACH ROW EXECUTE FUNCTION public.set_shipping_settings_updated_at();