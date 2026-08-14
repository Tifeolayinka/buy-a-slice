"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mail } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/wall", label: "Birthday Wall", icon: Mail },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/90 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-16 w-full max-w-xl items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-24 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
