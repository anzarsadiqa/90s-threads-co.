CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL,
  discount_price numeric(10,2),
  category text NOT NULL,
  images text[] NOT NULL DEFAULT '{}',
  sizes text[] NOT NULL DEFAULT '{}',
  colors text[] NOT NULL DEFAULT '{}',
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  payment_method text NOT NULL DEFAULT 'COD',
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  size text,
  color text,
  price numeric(10,2) NOT NULL
);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view order items" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX orders_created_at_idx ON public.orders (created_at DESC);
CREATE INDEX order_items_order_id_idx ON public.order_items (order_id);

INSERT INTO public.products (name, description, price, discount_price, category, images, sizes, colors, stock) VALUES
('Faded Sun Oversized Tee', 'Heavyweight 240 GSM cotton oversized tee with a washed sun print. Drop shoulders, boxy fit and a garment-dyed finish that fades beautifully with every wash.', 1499, 1099, 'Oversized T-Shirts', ARRAY['/__l5e/assets-v1/56804198-2a4c-4415-9d51-363400dfc4f9/p1.jpg'], ARRAY['S','M','L','XL','XXL'], ARRAY['Black','Off White'], 24),
('Static TV Graphic Tee', 'Off-white graphic tee with a retro television screen print pulled straight from late-night 90s reruns. Soft-hand screen print, relaxed fit.', 1399, 999, 'Graphic Tees', ARRAY['/__l5e/assets-v1/5338bbf5-ad9f-4861-9db8-900aa570da1b/p2.jpg'], ARRAY['S','M','L','XL'], ARRAY['Off White'], 18),
('Cassette Club Graphic Tee', 'Washed navy tee with a mixtape cassette print. Pre-shrunk cotton, ribbed collar and a lived-in vintage handfeel.', 1399, NULL, 'Graphic Tees', ARRAY['/__l5e/assets-v1/57b5c392-e79f-48a4-9587-2658c30b4051/p3.jpg'], ARRAY['S','M','L','XL','XXL'], ARRAY['Navy'], 21),
('Blank Essentials Oversized Tee', 'The everyday staple. Sage green, 240 GSM, boxy oversized cut with a clean stitched hem. No print, all fit.', 1299, 899, 'Oversized T-Shirts', ARRAY['/__l5e/assets-v1/6fe77695-96a9-4d39-ab97-17ed3f4a3155/p12.jpg'], ARRAY['S','M','L','XL','XXL'], ARRAY['Sage','Bone'], 30),
('Washed Blue Baggy Jeans', 'Wide-leg baggy jeans in a light stone wash. Rigid non-stretch denim, high rise and a full puddle break.', 2799, 2199, 'Baggy Jeans', ARRAY['/__l5e/assets-v1/7f9c650e-1a78-456f-a76e-328ac03b547f/p4.jpg'], ARRAY['28','30','32','34','36'], ARRAY['Light Blue'], 14),
('Charcoal Carpenter Baggy Jeans', 'Carpenter-detailed baggy jeans in overdyed charcoal denim with a hammer loop and utility pockets.', 2999, NULL, 'Baggy Jeans', ARRAY['/__l5e/assets-v1/1d66cbf7-f711-42ff-ae58-3460ac9a53b5/p5.jpg'], ARRAY['28','30','32','34'], ARRAY['Charcoal'], 11),
('Utility Cargo Pants — Olive', 'Six-pocket cargo pants in olive cotton twill. Straight leg, cinch hem and reinforced stitching throughout.', 2499, 1899, 'Cargo Pants', ARRAY['/__l5e/assets-v1/c3d6faaf-3a58-425f-a7f0-ebeb8c8c27b1/p6.jpg'], ARRAY['28','30','32','34','36'], ARRAY['Olive'], 16),
('Street Cargo Pants — Sand', 'Relaxed sand cargo pants with elasticated hems and flap pockets. Built for everyday wear, softens over time.', 2399, NULL, 'Cargo Pants', ARRAY['/__l5e/assets-v1/50aef138-8c4e-46d8-83f4-11f0d9d4ca43/p7.jpg'], ARRAY['28','30','32','34'], ARRAY['Sand'], 9),
('Heavy Fleece Hoodie — Bone', '420 GSM brushed fleece hoodie in bone. Double-layer hood, kangaroo pocket and a heavy boxy drape.', 3299, 2499, 'Hoodies', ARRAY['/__l5e/assets-v1/d58867fb-f742-4540-a605-984168cdc199/p8.jpg'], ARRAY['S','M','L','XL','XXL'], ARRAY['Bone'], 20),
('Arcade Era Hoodie — Black', 'Black oversized hoodie with a faded arcade cabinet print. Heavy fleece inside, vintage wash outside.', 3499, 2799, 'Hoodies', ARRAY['/__l5e/assets-v1/e7bfcc6d-df14-491c-b7f3-140f4c901537/p9.jpg'], ARRAY['S','M','L','XL'], ARRAY['Black'], 13),
('Stone Denim Trucker Jacket', 'Classic trucker jacket in stone-washed rigid denim. Boxy 90s cut, chest flap pockets and antique brass buttons.', 3999, 3199, 'Jackets', ARRAY['/__l5e/assets-v1/9579c6c9-b583-4252-a0c4-ad3eb2d1c6c7/p10.jpg'], ARRAY['S','M','L','XL'], ARRAY['Stone'], 8),
('Varsity Bomber Jacket', 'Cream and maroon varsity bomber with ribbed collar, cuffs and hem. Satin-touch shell, quilted lining.', 4599, 3699, 'Jackets', ARRAY['/__l5e/assets-v1/86f96e4d-039c-4216-9465-eb1e922c61ab/p11.jpg'], ARRAY['S','M','L','XL'], ARRAY['Cream'], 6);