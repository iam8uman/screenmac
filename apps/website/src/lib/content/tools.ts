/**
 * Free browser tools and quizzes. Tool pages live at src/app/tools/<slug>/page.tsx and
 * render <ToolShell slug="...">. The /tools hub, sitemap, llms.txt and JSON-LD read from here.
 */
export interface Faq {
  question: string;
  answer: string;
}

export interface ToolEntry {
  slug: string;
  name: string;
  card: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
  faq: Faq[];
  related: string[];
  /** Set for tools that live outside /tools, such as the editor. */
  href?: string;
  draft?: boolean;
}

export const TOOLS: ToolEntry[] = [
  {
    slug: "editor",
    href: "/editor",
    name: "Screenshot Editor",
    card: "Annotate, blur, pixelate and crop a screenshot in your browser, then export a PNG. Nothing is uploaded.",
    intro: "",
    seoTitle: "",
    seoDescription: "",
    faq: [],
    related: [],
  },
  {
    slug: "mac-screenshot-shortcuts",
    name: "Mac Screenshot Shortcuts Finder",
    card: "Pick what you want to capture and where it should go; get the exact macOS shortcut.",
    intro:
      "Choose what you want to capture and where you want it to end up, and get the exact keyboard shortcut for macOS, plus the full cheat sheet to print.",
    seoTitle: "Mac Screenshot Shortcuts: Finder and Cheat Sheet (2027)",
    seoDescription:
      "Find the right Mac screenshot shortcut in two clicks: full screen, area, window, no shadow, to clipboard or with a timer. Printable cheat sheet included.",
    faq: [
      {
        question: "What is the shortcut for a screenshot on a Mac?",
        answer:
          "Shift-Command-3 captures the whole screen, Shift-Command-4 lets you drag to select an area, and Shift-Command-5 opens the Screenshot app with every option, including screen recording.",
      },
      {
        question: "How do I copy a screenshot instead of saving it?",
        answer:
          "Add Control to the shortcut. Control-Shift-Command-3 copies the whole screen and Control-Shift-Command-4 copies a selected area, ready to paste.",
      },
      {
        question: "How do I screenshot a window without the shadow?",
        answer:
          "Press Shift-Command-4, then Space, and hold Option while you click the window. The capture leaves out the drop shadow.",
      },
      {
        question: "Where do Mac screenshots go?",
        answer:
          "To the desktop by default. Press Shift-Command-5, open Options, and choose another folder, the clipboard, or an app such as Preview or Mail.",
      },
    ],
    related: [],
  },
];

export const toolHref = (t: ToolEntry) => t.href ?? `/tools/${t.slug}`;
export const publishedTools = () => TOOLS.filter((t) => !t.draft);
export function getTool(slug: string) {
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) throw new Error(`Unknown tool: ${slug}`);
  return tool;
}
