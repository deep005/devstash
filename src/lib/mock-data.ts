/**
 * Mock data for the DevStash dashboard UI.
 *
 * Single source of truth for UI development until the database is wired up.
 * Shapes mirror the Prisma schema (see context/project-overview.md) but are
 * flattened for easy rendering (tags and collections are plain arrays of ids).
 *
 * This is display data only — no helpers, no logic. Import and render.
 */

// ============================================
// Types
// ============================================

export type ContentType = "TEXT" | "FILE" | "URL";

export type ItemTypeName =
  | "snippet"
  | "prompt"
  | "command"
  | "note"
  | "file"
  | "image"
  | "link";

export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  isPro: boolean;
}

export interface ItemType {
  id: string;
  name: ItemTypeName;
  /** Lucide icon name, e.g. "Code", "Sparkles". */
  icon: string;
  /** Hex color used for the type accent. */
  color: string;
  isSystem: boolean;
  /** Number of items of this type — shown next to the type in the sidebar. */
  count: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  /** Number of items in this collection. */
  itemCount: number;
  /** Item types present in this collection — used for the type icons on cards. */
  typeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  title: string;
  contentType: ContentType;
  /** Text body for TEXT types (snippet, prompt, command, note). */
  content: string | null;
  /** URL for URL/link types. */
  url: string | null;
  /** Original filename for FILE types. */
  fileName: string | null;
  description: string;
  isFavorite: boolean;
  isPinned: boolean;
  /** Programming language for syntax highlighting, when relevant. */
  language: string | null;
  tags: string[];
  itemTypeId: string;
  collectionIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Current user
// ============================================

export const currentUser: User = {
  id: "user_1",
  email: "john@example.com",
  name: "John Doe",
  image: null,
  isPro: true,
};

// ============================================
// Item types (system types)
// ============================================

export const itemTypes: ItemType[] = [
  { id: "type_snippet", name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true, count: 24 },
  { id: "type_prompt", name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true, count: 18 },
  { id: "type_command", name: "command", icon: "Terminal", color: "#f97316", isSystem: true, count: 15 },
  { id: "type_note", name: "note", icon: "StickyNote", color: "#fde047", isSystem: true, count: 12 },
  { id: "type_file", name: "file", icon: "File", color: "#6b7280", isSystem: true, count: 5 },
  { id: "type_image", name: "image", icon: "Image", color: "#ec4899", isSystem: true, count: 3 },
  { id: "type_link", name: "link", icon: "Link", color: "#10b981", isSystem: true, count: 8 },
];

// ============================================
// Collections
// ============================================

export const collections: Collection[] = [
  {
    id: "col_react_patterns",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    isFavorite: true,
    itemCount: 12,
    typeIds: ["type_snippet", "type_file", "type_link"],
    createdAt: "2026-05-02T09:00:00.000Z",
    updatedAt: "2026-07-08T14:20:00.000Z",
  },
  {
    id: "col_python_snippets",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    isFavorite: false,
    itemCount: 8,
    typeIds: ["type_snippet", "type_file"],
    createdAt: "2026-05-10T11:30:00.000Z",
    updatedAt: "2026-07-01T10:05:00.000Z",
  },
  {
    id: "col_context_files",
    name: "Context Files",
    description: "AI context files for projects",
    isFavorite: true,
    itemCount: 5,
    typeIds: ["type_file", "type_note"],
    createdAt: "2026-05-18T16:45:00.000Z",
    updatedAt: "2026-07-09T08:15:00.000Z",
  },
  {
    id: "col_interview_prep",
    name: "Interview Prep",
    description: "Technical interview preparation",
    isFavorite: false,
    itemCount: 24,
    typeIds: ["type_note", "type_snippet", "type_link", "type_prompt"],
    createdAt: "2026-04-22T13:00:00.000Z",
    updatedAt: "2026-07-06T19:40:00.000Z",
  },
  {
    id: "col_git_commands",
    name: "Git Commands",
    description: "Frequently used git commands",
    isFavorite: true,
    itemCount: 15,
    typeIds: ["type_command", "type_note"],
    createdAt: "2026-04-30T08:20:00.000Z",
    updatedAt: "2026-07-07T12:10:00.000Z",
  },
  {
    id: "col_ai_prompts",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    isFavorite: false,
    itemCount: 18,
    typeIds: ["type_prompt", "type_snippet", "type_file"],
    createdAt: "2026-05-25T15:00:00.000Z",
    updatedAt: "2026-07-10T09:30:00.000Z",
  },
];

// ============================================
// Items
// ============================================

export const items: Item[] = [
  {
    id: "item_use_auth_hook",
    title: "useAuth Hook",
    contentType: "TEXT",
    content:
      "export function useAuth() {\n  const [user, setUser] = useState<User | null>(null);\n  // ...\n  return { user, signIn, signOut };\n}",
    url: null,
    fileName: null,
    description: "Custom authentication hook for React applications",
    isFavorite: true,
    isPinned: true,
    language: "typescript",
    tags: ["react", "auth", "hooks"],
    itemTypeId: "type_snippet",
    collectionIds: ["col_react_patterns"],
    createdAt: "2026-06-15T10:00:00.000Z",
    updatedAt: "2026-07-05T11:00:00.000Z",
  },
  {
    id: "item_api_error_handling",
    title: "API Error Handling Pattern",
    contentType: "TEXT",
    content:
      "async function fetchWithRetry(url: string, retries = 3) {\n  // exponential backoff retry logic\n}",
    url: null,
    fileName: null,
    description: "Fetch wrapper with exponential backoff retry logic",
    isFavorite: false,
    isPinned: true,
    language: "typescript",
    tags: ["fetch", "error-handling", "resilience"],
    itemTypeId: "type_snippet",
    collectionIds: ["col_react_patterns", "col_interview_prep"],
    createdAt: "2026-06-12T09:30:00.000Z",
    updatedAt: "2026-07-02T16:20:00.000Z",
  },
  {
    id: "item_code_review_prompt",
    title: "Code Review Prompt",
    contentType: "TEXT",
    content:
      "Review the following code for bugs, readability, and performance. Suggest concrete improvements.",
    url: null,
    fileName: null,
    description: "Thorough code review prompt for AI assistants",
    isFavorite: true,
    isPinned: false,
    language: null,
    tags: ["ai", "review", "quality"],
    itemTypeId: "type_prompt",
    collectionIds: ["col_ai_prompts"],
    createdAt: "2026-06-20T14:10:00.000Z",
    updatedAt: "2026-07-04T10:45:00.000Z",
  },
  {
    id: "item_git_reset_hard",
    title: "git reset --hard HEAD~1",
    contentType: "TEXT",
    content: "git reset --hard HEAD~1",
    url: null,
    fileName: null,
    description: "Undo the last commit and discard changes",
    isFavorite: false,
    isPinned: false,
    language: "bash",
    tags: ["git", "reset"],
    itemTypeId: "type_command",
    collectionIds: ["col_git_commands"],
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-28T09:00:00.000Z",
  },
  {
    id: "item_debounce_snippet",
    title: "Debounce Utility",
    contentType: "TEXT",
    content:
      "export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {\n  let t: ReturnType<typeof setTimeout>;\n  return (...args: Parameters<T>) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), ms);\n  };\n}",
    url: null,
    fileName: null,
    description: "Generic debounce helper for input handlers",
    isFavorite: false,
    isPinned: false,
    language: "typescript",
    tags: ["utility", "performance"],
    itemTypeId: "type_snippet",
    collectionIds: ["col_react_patterns"],
    createdAt: "2026-06-25T12:00:00.000Z",
    updatedAt: "2026-07-01T13:30:00.000Z",
  },
  {
    id: "item_list_comprehension",
    title: "Flatten Nested List",
    contentType: "TEXT",
    content: "flat = [x for row in matrix for x in row]",
    url: null,
    fileName: null,
    description: "Flatten a 2D list with a comprehension",
    isFavorite: false,
    isPinned: false,
    language: "python",
    tags: ["python", "list"],
    itemTypeId: "type_snippet",
    collectionIds: ["col_python_snippets"],
    createdAt: "2026-06-18T15:20:00.000Z",
    updatedAt: "2026-06-30T09:10:00.000Z",
  },
  {
    id: "item_project_context",
    title: "Project Context",
    contentType: "FILE",
    content: null,
    url: null,
    fileName: "project-context.md",
    description: "High-level project context for AI pair programming",
    isFavorite: false,
    isPinned: false,
    language: null,
    tags: ["context", "ai"],
    itemTypeId: "type_file",
    collectionIds: ["col_context_files"],
    createdAt: "2026-06-22T11:00:00.000Z",
    updatedAt: "2026-07-03T10:00:00.000Z",
  },
  {
    id: "item_big_o_notes",
    title: "Big-O Cheat Sheet",
    contentType: "TEXT",
    content:
      "- Array access: O(1)\n- Hash lookup: O(1) avg\n- Binary search: O(log n)\n- Merge sort: O(n log n)",
    url: null,
    fileName: null,
    description: "Time complexity quick reference for interviews",
    isFavorite: true,
    isPinned: false,
    language: null,
    tags: ["algorithms", "interview"],
    itemTypeId: "type_note",
    collectionIds: ["col_interview_prep"],
    createdAt: "2026-05-28T09:00:00.000Z",
    updatedAt: "2026-06-29T14:00:00.000Z",
  },
  {
    id: "item_nextjs_docs_link",
    title: "Next.js Documentation",
    contentType: "URL",
    content: null,
    url: "https://nextjs.org/docs",
    fileName: null,
    description: "Official Next.js docs",
    isFavorite: false,
    isPinned: false,
    language: null,
    tags: ["nextjs", "docs"],
    itemTypeId: "type_link",
    collectionIds: ["col_react_patterns"],
    createdAt: "2026-06-05T10:30:00.000Z",
    updatedAt: "2026-06-27T08:45:00.000Z",
  },
  {
    id: "item_git_squash_note",
    title: "Squash Last N Commits",
    contentType: "TEXT",
    content: "git rebase -i HEAD~N  # then mark commits as 'squash'",
    url: null,
    fileName: null,
    description: "How to squash multiple commits into one",
    isFavorite: false,
    isPinned: false,
    language: "bash",
    tags: ["git", "rebase"],
    itemTypeId: "type_command",
    collectionIds: ["col_git_commands"],
    createdAt: "2026-06-08T13:15:00.000Z",
    updatedAt: "2026-06-26T17:00:00.000Z",
  },
];
