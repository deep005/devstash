import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  name: string | null | undefined;
  email: string;
  image: string | null | undefined;
  size?: "sm" | "default" | "lg";
  className?: string;
}

/**
 * Derive up to two initials for the fallback: first+last initial of the name,
 * e.g. "Brad Traversy" → "BT". Falls back to the email's first character when
 * no name is available.
 */
export function getInitials(
  name: string | null | undefined,
  email: string,
): string {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return email.charAt(0).toUpperCase() || "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

/**
 * Reusable user avatar: shows the user's image when present (e.g. GitHub),
 * otherwise a colored circle with their initials. Radix's Avatar falls back to
 * the initials automatically if the image is missing or fails to load.
 */
export function UserAvatar({
  name,
  email,
  image,
  size = "default",
  className,
}: UserAvatarProps) {
  return (
    <Avatar size={size} className={cn("bg-muted", className)}>
      {image && <AvatarImage src={image} alt={name ?? email} />}
      <AvatarFallback className="font-medium">
        {getInitials(name, email)}
      </AvatarFallback>
    </Avatar>
  );
}
