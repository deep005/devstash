import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Dashboard top bar.
 *
 * Phase 1: display only. The search field and "New Item" button are not wired
 * to any behavior yet — that comes in a later phase.
 */
export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items..."
          aria-label="Search items"
          className="pl-9"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[0.7rem] text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      </div>

      <Button className="ml-auto">
        <Plus />
        New Item
      </Button>
    </header>
  );
}
