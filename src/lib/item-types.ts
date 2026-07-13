import { itemTypes, type ItemType } from "@/lib/mock-data";

const itemTypesById = new Map<string, ItemType>(
  itemTypes.map((type) => [type.id, type]),
);

/** Looks up a system item type by its id (e.g. "type_snippet"). */
export function getItemTypeById(id: string): ItemType | undefined {
  return itemTypesById.get(id);
}
