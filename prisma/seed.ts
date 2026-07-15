import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { ContentType, PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@devstash.io";
const DEMO_PASSWORD = "12345678";
const BCRYPT_ROUNDS = 12;

// ============================================
// SYSTEM ITEM TYPES
// ============================================
const systemItemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "command", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "file", icon: "File", color: "#6b7280", isSystem: true },
  { name: "image", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "link", icon: "Link", color: "#10b981", isSystem: true },
];

// ============================================
// SAMPLE DATA
// ============================================
type SeedItemType = "snippet" | "prompt" | "command" | "link";

interface SeedItem {
  title: string;
  type: SeedItemType;
  description?: string;
  content?: string;
  language?: string;
  url?: string;
}

interface SeedCollection {
  name: string;
  description: string;
  isFavorite?: boolean;
  items: SeedItem[];
}

const sampleCollections: SeedCollection[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    isFavorite: true,
    items: [
      {
        title: "useDebounce hook",
        type: "snippet",
        language: "typescript",
        description: "Debounce a rapidly changing value",
        content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
`,
      },
      {
        title: "Theme context provider",
        type: "snippet",
        language: "tsx",
        description: "Context provider pattern with a typed consumer hook",
        content: `import { createContext, useContext, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(
  null,
);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
`,
      },
      {
        title: "cn() class name helper",
        type: "snippet",
        language: "typescript",
        description: "Merge Tailwind classes, resolving conflicts",
        content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind class names, resolving conflicts (last one wins).
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
`,
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    items: [
      {
        title: "Code review prompt",
        type: "prompt",
        description: "Structured, severity-ordered code review",
        content: `You are an expert code reviewer. Review the code below for correctness,
security, performance, and readability.

For each issue: cite the location, explain the impact, and suggest a concrete
fix. Order findings by severity (most severe first). If nothing is wrong, say so.

Code:

{{code}}
`,
      },
      {
        title: "Documentation generation prompt",
        type: "prompt",
        description: "Generate docs that match the project style",
        content: `Generate clear documentation for the code below. Include:

- A one-line summary of what it does
- Parameters with types and descriptions
- Return value and possible errors
- A short, runnable usage example

Match the project's existing documentation style.

Code:

{{code}}
`,
      },
      {
        title: "Refactoring assistant prompt",
        type: "prompt",
        description: "Behavior-preserving refactors with rationale",
        content: `Refactor the code below to improve readability and maintainability WITHOUT
changing its behavior or public API.

Explain each change briefly and call out any assumptions you make. Prefer small,
focused improvements over large rewrites.

Code:

{{code}}
`,
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    isFavorite: true,
    items: [
      {
        title: "Next.js multi-stage Dockerfile",
        type: "snippet",
        language: "dockerfile",
        description: "Production image with deps/build/runner stages",
        content: `# Multi-stage build for a Next.js app
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
`,
      },
      {
        title: "Deploy to production (Vercel)",
        type: "command",
        language: "bash",
        description: "Pull env, build, and deploy a prebuilt output",
        content: `vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod`,
      },
      {
        title: "Docker documentation",
        type: "link",
        description: "Official Docker reference and guides",
        url: "https://docs.docker.com/",
      },
      {
        title: "GitHub Actions documentation",
        type: "link",
        description: "CI/CD workflows on GitHub",
        url: "https://docs.github.com/en/actions",
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    items: [
      {
        title: "Undo last commit, keep changes",
        type: "command",
        language: "bash",
        content: "git reset --soft HEAD~1",
      },
      {
        title: "Prune unused Docker resources",
        type: "command",
        language: "bash",
        content: "docker system prune -af --volumes",
      },
      {
        title: "Kill the process on a port",
        type: "command",
        language: "bash",
        content: "lsof -ti:3000 | xargs kill -9",
      },
      {
        title: "List outdated npm packages",
        type: "command",
        language: "bash",
        content: "npm outdated",
      },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    items: [
      {
        title: "Tailwind CSS documentation",
        type: "link",
        description: "Utility-first CSS framework reference",
        url: "https://tailwindcss.com/docs",
      },
      {
        title: "shadcn/ui",
        type: "link",
        description: "Accessible React component library",
        url: "https://ui.shadcn.com",
      },
      {
        title: "Material Design 3",
        type: "link",
        description: "Google's design system guidelines",
        url: "https://m3.material.io/",
      },
      {
        title: "Lucide",
        type: "link",
        description: "Open-source icon library",
        url: "https://lucide.dev/",
      },
    ],
  },
];

// ============================================
// SEED FUNCTIONS
// ============================================

// System types have `userId = null`. Postgres treats NULLs as distinct, so the
// `@@unique([name, userId])` constraint does not cover them and the generated
// `name_userId` unique input types `userId` as non-null — meaning `upsert`
// can't target these rows. Find-then-create keeps the seed idempotent instead.
async function seedSystemItemTypes(): Promise<void> {
  for (const type of systemItemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, userId: null },
    });

    if (!existing) {
      await prisma.itemType.create({ data: type });
    }
  }
}

// Sample data is for INITIAL seeding only. Once the demo user exists we skip it
// entirely, so anything the user later changes in the app is preserved and
// reflected on subsequent runs (no reset, no overwrite, no duplicates).
async function seedSampleData(): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    console.log(`Demo user ${DEMO_EMAIL} already exists — skipping sample data.`);
    return;
  }

  const password = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: "Demo User",
      password,
      isPro: false,
      emailVerified: new Date(),
    },
  });

  const types = await prisma.itemType.findMany({
    where: { isSystem: true, userId: null },
    select: { id: true, name: true },
  });
  const itemTypeIdByName = new Map(types.map((t) => [t.name, t.id]));

  for (const collection of sampleCollections) {
    const created = await prisma.collection.create({
      data: {
        name: collection.name,
        description: collection.description,
        isFavorite: collection.isFavorite ?? false,
        userId: user.id,
      },
    });

    for (const item of collection.items) {
      const itemTypeId = itemTypeIdByName.get(item.type);
      if (!itemTypeId) {
        throw new Error(`Missing system item type "${item.type}"`);
      }

      await prisma.item.create({
        data: {
          title: item.title,
          description: item.description,
          contentType: item.type === "link" ? ContentType.URL : ContentType.TEXT,
          content: item.content,
          language: item.language,
          url: item.url,
          userId: user.id,
          itemTypeId,
          collections: { create: { collectionId: created.id } },
        },
      });
    }
  }

  const itemCount = sampleCollections.reduce((n, c) => n + c.items.length, 0);
  console.log(
    `Created demo user, ${sampleCollections.length} collections, ${itemCount} items.`,
  );
}

async function main(): Promise<void> {
  console.log("Seeding database…");
  await seedSystemItemTypes();
  await seedSampleData();
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
