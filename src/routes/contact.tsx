import { createFileRoute } from "@tanstack/react-router";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";
import { BUSINESS, mapsHref, telHref, whatsappHref } from "@/lib/business";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — 90'S CLOTHING" },
      {
        name: "description",
        content: `Call or WhatsApp 90's Clothing on ${BUSINESS.phoneDisplay}. Store in Peer Gate Area, Bhopal, open ${BUSINESS.hours}.`,
      },
      { property: "og:title", content: "Contact — 90'S CLOTHING" },
      { property: "og:description", content: "Call or WhatsApp us, or visit the store in Bhopal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <StoreLayout>
      <PageHeader title="Contact us" subtitle="Call, WhatsApp or visit us in Bhopal." />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-14 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href={telHref}
            className="micro-label inline-flex items-center justify-center gap-2 bg-ink px-6 py-4 text-paper transition-colors hover:bg-accent"
          >
            <Phone className="size-4" /> Call {BUSINESS.phoneDisplay}
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer noopener"
            className="micro-label inline-flex items-center justify-center gap-2 border border-ink/25 px-6 py-4 transition-colors hover:bg-ink hover:text-paper"
          >
            <MessageCircle className="size-4" /> WhatsApp {BUSINESS.whatsapp}
          </a>
        </div>

        <div className="space-y-6 text-sm">
          <div className="flex items-start gap-3 border-b border-ink/10 pb-5">
            <MapPin className="mt-0.5 size-5 text-accent" />
            <div>
              <p className="micro-label text-muted-foreground">Store address</p>
              <a href={mapsHref} target="_blank" rel="noreferrer noopener" className="mt-1 block font-bold">
                {BUSINESS.address}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 size-5 text-accent" />
            <div>
              <p className="micro-label text-muted-foreground">Phone &amp; WhatsApp</p>
              <p className="mt-1 font-bold">{BUSINESS.phoneDisplay}</p>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
