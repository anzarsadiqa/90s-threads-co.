import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "How do your sizes fit?",
    a: "Everything is cut oversized to true 90s proportions. If you want a regular fit, size down one. Exact chest and length measurements are listed on each product page.",
  },
  {
    q: "How long does delivery take?",
    a: "Orders ship within 24–48 hours and arrive in 3–6 working days anywhere in India. Metro cities are usually 3 days.",
  },
  {
    q: "Do you offer cash on delivery?",
    a: "Yes. Cash on delivery is available on every order across India at no extra cost.",
  },
  {
    q: "What is your return policy?",
    a: "Return anything unworn with tags attached within 7 days of delivery for a full refund or exchange. Reach out on hello@90sclothing.in to start a return.",
  },
  {
    q: "How should I wash my pieces?",
    a: "Cold machine wash inside out, mild detergent, no bleach, line dry in shade. Denim is best washed sparingly to keep the fades sharp.",
  },
  {
    q: "Is shipping free?",
    a: "Shipping is free on all orders above ₹1999. Below that it is a flat ₹99.",
  },
] as const;

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — 90'S CLOTHING" },
      {
        name: "description",
        content: "Sizing, shipping, cash on delivery, returns and care instructions answered.",
      },
      { property: "og:title", content: "FAQ — 90'S CLOTHING" },
      { property: "og:description", content: "Everything you need to know before ordering." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <StoreLayout>
      <PageHeader title="FAQ" subtitle="Sizing, shipping, payments and returns." />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((item, index) => (
            <AccordionItem key={item.q} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-sm font-bold uppercase tracking-wide">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      </div>
    </StoreLayout>
  );
}
