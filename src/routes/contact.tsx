import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — 90'S CLOTHING" },
      {
        name: "description",
        content: "Questions about sizing, orders or returns? Reach the 90'S Clothing team.",
      },
      { property: "og:title", content: "Contact — 90'S CLOTHING" },
      { property: "og:description", content: "Email, call or DM us — we reply within 24 hours." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <StoreLayout>
      <PageHeader title="Contact us" subtitle="We reply within 24 hours, Monday to Saturday." />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div className="space-y-6 text-sm">
          {[
            { icon: Mail, label: "Email", value: "hello@90sclothing.in" },
            { icon: Phone, label: "Phone", value: "+91 98765 43210" },
            { icon: MapPin, label: "Studio", value: "Bandra West, Mumbai 400050" },
            { icon: Instagram, label: "Instagram", value: "@90sclothing" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 border-b border-ink/10 pb-5">
              <item.icon className="mt-0.5 size-5 text-accent" />
              <div>
                <p className="micro-label text-muted-foreground">{item.label}</p>
                <p className="mt-1 font-bold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            toast.success("Message sent", { description: "We'll get back to you within 24 hours." });
            (e.target as HTMLFormElement).reset();
          }}
          className="space-y-5 border border-ink/15 bg-card p-6"
        >
          <h2 className="text-2xl">Send a message</h2>
          <label className="block">
            <span className="micro-label">Name</span>
            <input
              required
              maxLength={80}
              className="mt-2 w-full border border-ink/25 bg-background px-3 py-3 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="micro-label">Email</span>
            <input
              required
              type="email"
              maxLength={160}
              className="mt-2 w-full border border-ink/25 bg-background px-3 py-3 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="micro-label">Message</span>
            <textarea
              required
              rows={5}
              maxLength={1000}
              className="mt-2 w-full border border-ink/25 bg-background px-3 py-3 text-sm outline-none focus:border-accent"
            />
          </label>
          <button
            type="submit"
            className="micro-label w-full bg-ink py-4 text-paper transition-colors hover:bg-accent"
          >
            {sent ? "Message sent" : "Send message"}
          </button>
        </form>
      </div>
    </StoreLayout>
  );
}
