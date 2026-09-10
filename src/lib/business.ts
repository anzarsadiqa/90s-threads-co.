export const BUSINESS = {
  name: "90's Clothing",
  phone: "6266166950",
  phoneDisplay: "6266166950",
  whatsapp: "6266166950",
  address:
    "Nasheman Building, Nadeem Road, Near Jahangiriya School, Ibrahimpura, Peer Gate Area, Bhopal, Madhya Pradesh 462001",
  hours: "12 PM – 11 PM",
} as const;

export const telHref = `tel:+91${BUSINESS.phone}`;
export const whatsappHref = `https://wa.me/91${BUSINESS.whatsapp}`;
export const mapsHref = `https://maps.google.com/?q=${encodeURIComponent(BUSINESS.address)}`;

export const DELIVERY_FEE = 100;
export const FREE_DELIVERY_ABOVE = 1500;
export const COD_FEE = 49;
export const DELIVERY_DAYS = "6–7 days";
export const RETURN_WINDOW_DAYS = 7;

export function orderCharges(subtotal: number) {
  const delivery = subtotal <= 0 || subtotal > FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const cod = subtotal <= 0 ? 0 : COD_FEE;
  return { subtotal, delivery, cod, total: subtotal + delivery + cod };
}

export const RETURN_POLICY =
  "Returns are accepted only if the product is delivered damaged. Raise the request within 7 days of delivery and share an unboxing video as proof — it is required for every damaged-product return.";
