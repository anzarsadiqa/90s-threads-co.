import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="space-y-4">
          <BrandLogo className="h-10" invert />
          <p className="text-sm text-paper/60">
            Vintage-cut streetwear built in India. Heavyweight cotton, boxy fits, 90s energy.
          </p>
          <a
            href="https://www.instagram.com/90sclothin.bhopal/"
            target="_blank"
            rel="noreferrer noopener"
            className="micro-label inline-flex items-center gap-2 text-paper/70 hover:text-paper"
          >
            <Instagram className="size-4" /> Instagram
          </a>
        </div>

        <div>
          <h3 className="micro-label mb-4 text-paper/50">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/shop" className="text-paper/80 hover:text-paper">
                All products
              </Link>
            </li>
            <li>
              <Link
                to="/shop"
                search={{ category: "Oversized T-Shirts" }}
                className="text-paper/80 hover:text-paper"
              >
                Oversized T-Shirts
              </Link>
            </li>
            <li>
              <Link
                to="/shop"
                search={{ category: "Baggy Jeans" }}
                className="text-paper/80 hover:text-paper"
              >
                Baggy Jeans
              </Link>
            </li>
            <li>
              <Link
                to="/shop"
                search={{ category: "Hoodies" }}
                className="text-paper/80 hover:text-paper"
              >
                Hoodies
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="micro-label mb-4 text-paper/50">Company</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="text-paper/80 hover:text-paper">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-paper/80 hover:text-paper">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-paper/80 hover:text-paper">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/auth" className="text-paper/80 hover:text-paper">
                Admin login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="micro-label mb-4 text-paper/50">Help</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/shipping" className="text-paper/80 hover:text-paper">
                Shipping information
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-paper/80 hover:text-paper">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-paper/80 hover:text-paper">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/15 px-4 py-5 text-center sm:px-6">
        <p className="micro-label text-paper/50">
          © {new Date().getFullYear()} 90'S Clothing — All rights reserved
        </p>
      </div>
    </footer>
  );
}
