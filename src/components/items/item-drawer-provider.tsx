"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { ItemDrawerBody } from "@/components/items/item-drawer-body";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { ItemDetail } from "@/lib/db/items";

/** Loading lifecycle of the drawer's detail fetch. */
export type DrawerStatus = "loading" | "loaded" | "error";

interface ItemDrawerContextValue {
  /** Open the drawer for the given item id and fetch its full detail. */
  openItem: (id: string) => void;
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

/** Access the item drawer; must be called under `ItemDrawerProvider`. */
export function useItemDrawer(): ItemDrawerContextValue {
  const context = useContext(ItemDrawerContext);
  if (!context) {
    throw new Error("useItemDrawer must be used within an ItemDrawerProvider");
  }
  return context;
}

/**
 * Provides the item detail drawer to the app shell. Item cards/rows call
 * `openItem(id)`; the drawer then fetches `/api/items/[id]` and renders the
 * detail, showing a skeleton while the request is in flight. Drawer state lives
 * here (a client boundary) so the pages themselves stay server components.
 */
export function ItemDrawerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ItemDetail | null>(null);
  const [status, setStatus] = useState<DrawerStatus>("loading");

  const openItem = useCallback((id: string) => {
    // Reset to the loading state here (an event handler) rather than in the
    // effect, so the effect never calls setState synchronously in its body.
    setStatus("loading");
    setDetail(null);
    setItemId(id);
    setOpen(true);
  }, []);

  // Fetch fresh detail whenever the drawer opens for an item. Re-opening the
  // same item refetches so edits made elsewhere are reflected.
  useEffect(() => {
    if (!open || !itemId) return;

    let active = true;
    const controller = new AbortController();

    fetch(`/api/items/${itemId}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        return (await response.json()) as ItemDetail;
      })
      .then((data) => {
        if (!active) return;
        setDetail(data);
        setStatus("loaded");
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [open, itemId]);

  return (
    <ItemDrawerContext.Provider value={{ openItem }}>
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-xl">
          <ItemDrawerBody status={status} detail={detail} />
        </SheetContent>
      </Sheet>
    </ItemDrawerContext.Provider>
  );
}
