"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthStatus } from "@/components/demo/AuthStatus";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/checkout", label: "Checkout" },
  { href: "/cost", label: "IT / Cost" },
  { href: "/developers", label: "Developers" },
  { href: "/trust", label: "Trust" },
  { href: "/login", label: "Login" },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand-mark">
          <span className="brand-name">ARIS</span>
          <span className="brand-tag">Adaptive retry for services</span>
        </Link>
        <div className="site-header-right">
          <nav className="site-nav" aria-label="Main">
            {LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={active ? "nav-link nav-link-active" : "nav-link"}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <AuthStatus variant="nav" />
        </div>
      </div>
    </header>
  );
}
