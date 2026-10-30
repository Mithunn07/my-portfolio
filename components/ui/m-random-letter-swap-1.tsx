"use client";

import { RandomLetterSwap } from "@/components/ui/random-letter-swap";

const links = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Work", href: "#work" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" },
];

export default function RandomLetterSwapNav() {
  return (
    <div className="flex min-h-50 items-center justify-center px-6">
      <nav className="flex items-center gap-8">
        {links.map((link) => (
          <a key={link.name} href={link.href}>
            <RandomLetterSwap
              className="cursor-pointer font-medium text-muted-foreground text-sm hover:text-foreground"
              label={link.name}
              staggerDuration={0.025}
              transition={{ duration: 0.6, type: "spring" }}
            />
          </a>
        ))}
      </nav>
    </div>
  );
}
