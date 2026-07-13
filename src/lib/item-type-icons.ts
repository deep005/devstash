import {
  Code,
  File,
  Image,
  Link,
  Sparkles,
  StickyNote,
  Terminal,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps the `icon` string stored on an ItemType (see mock-data / Prisma schema)
 * to its Lucide component. Falls back to `File` for unknown names.
 */
export const ITEM_TYPE_ICONS: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
};

export function getItemTypeIcon(icon: string): LucideIcon {
  return ITEM_TYPE_ICONS[icon] ?? File;
}
