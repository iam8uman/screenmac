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
    related: ["how-to-screenshot-on-mac", "where-do-screenshots-go-mac", "mac-screenshot-not-working", "snipping-tool-for-mac"],
  },
  {
    slug: "screen-recording-file-size-calculator",
    name: "Screen Recording File Size Calculator",
    card: "Estimate how big a recording will be from its bitrate and length, or the bitrate you need to fit a size limit.",
    intro:
      "Work out how large a screen recording will be from its bitrate and length, measure the bitrate of a recording you already have, or find the bitrate that keeps a video under an upload limit. Plain arithmetic you can check.",
    seoTitle: "Screen Recording File Size Calculator (Bitrate Maths)",
    seoDescription:
      "Estimate a screen recording's file size from bitrate and length, scale a sample recording, or find the bitrate that fits an upload limit. Free, runs in your browser.",
    faq: [
      {
        question: "How do I calculate a video's file size?",
        answer:
          "Multiply the total bitrate by the length and divide by eight. For example, 8 megabits per second for 60 seconds is 480 megabits, which is 60 megabytes.",
      },
      {
        question: "Why is my real file a different size from the estimate?",
        answer:
          "Most recorders use a variable bitrate, spending more data when lots changes on screen and less on still frames. The file container also adds a little overhead. A test recording with your own settings gives the most accurate input.",
      },
      {
        question: "Does this calculator know the bitrate of QuickTime or Screenmac?",
        answer:
          "No. It does not assume any app's bitrate, because that depends on resolution, frame rate and what is on screen. Measure it from a short sample recording instead.",
      },
      {
        question: "What does Mbps mean?",
        answer: "Megabits per second. Eight bits make one byte, so 8 Mbps is one megabyte of data every second.",
      },
    ],
    related: ["reduce-screen-recording-file-size-mac", "trim-screen-recording-mac", "record-screen-mac", "best-free-screen-recorders-mac-2027"],
  },
  {
    slug: "image-format-converter",
    name: "Screenshot Format Converter",
    card: "Convert a screenshot between PNG, JPG and WebP, resize it and strip its metadata, all in your browser.",
    intro:
      "Turn a PNG screenshot into a smaller JPG or WebP, or back to PNG, and scale it down if you like. The new file is built from pixels only, so it leaves the original's metadata behind. Nothing is uploaded.",
    seoTitle: "Convert Screenshot PNG to JPG or WebP Online, Free",
    seoDescription:
      "Convert a screenshot from PNG to JPG or WebP (or back) in your browser, pick quality and size, and download a copy without metadata. Nothing is uploaded.",
    faq: [
      {
        question: "Is my screenshot uploaded anywhere?",
        answer: "No. The conversion runs in your browser with the canvas API. The file never leaves your device.",
      },
      {
        question: "Should screenshots be PNG or JPG?",
        answer:
          "PNG keeps text and interface edges sharp and is usually the right choice for screenshots. JPG makes much smaller files for photos and busy images, but blurs fine text at lower quality.",
      },
      {
        question: "Does converting remove the metadata?",
        answer:
          "Yes. The output is encoded from the pixels alone, so EXIF and XMP fields from the original, such as the Screenshot comment macOS adds, are not copied.",
      },
      {
        question: "Can it open HEIC files?",
        answer:
          "Only if your browser can decode HEIC, which most cannot. On a Mac, open the file in Preview, choose File, Export, and pick PNG first.",
      },
    ],
    related: ["remove-metadata-from-screenshot-mac", "how-to-screenshot-on-mac", "redact-sensitive-info-screenshot"],
  },
  {
    slug: "aspect-ratio-calculator",
    name: "Aspect Ratio and Crop Size Calculator",
    card: "Find an image's aspect ratio, resize without distortion, and get exact crop or padding sizes for any ratio.",
    intro:
      "Enter a width and height to get the aspect ratio, the matching size at a new width or height, and the exact pixel size to crop or pad to 1:1, 4:5, 16:9 and other common ratios.",
    seoTitle: "Aspect Ratio Calculator for Screenshots and Images",
    seoDescription:
      "Get the aspect ratio of any image size, resize without distortion, and find the exact crop or padding to reach 16:9, 4:5, 1:1 or 9:16. Free and instant.",
    faq: [
      {
        question: "How do I work out an aspect ratio?",
        answer:
          "Divide the width and height by their greatest common divisor. 1920 and 1080 share 120, which gives 16:9.",
      },
      {
        question: "How do I resize an image without stretching it?",
        answer:
          "Keep the ratio: new height equals new width times the original height divided by the original width. The calculator does this and rounds to whole pixels.",
      },
      {
        question: "Should I crop or pad to change the ratio?",
        answer:
          "Crop when the edges do not matter. Pad when everything must stay visible, as with most screenshots of text or interfaces.",
      },
      {
        question: "Why is my Mac screenshot twice the size I expected?",
        answer:
          "On a Retina display each point on screen is drawn with two pixels in each direction, so screenshots are saved at that higher pixel size.",
      },
    ],
    related: ["how-to-screenshot-on-mac", "screenshot-window-without-shadow-mac", "blur-part-of-screenshot-mac"],
  },
  {
    slug: "screenshot-window-frame",
    name: "Screenshot Window Frame and Background",
    card: "Put a screenshot in a simple window or browser frame with padding, background and shadow, then export a PNG.",
    intro:
      "Give a plain screenshot a tidy presentation: wrap it in a simple window or browser bar, add padding, a colour or gradient background and a soft shadow, then download a full-resolution PNG. Everything happens in your browser.",
    seoTitle: "Screenshot Frame and Background Tool, Free in Browser",
    seoDescription:
      "Add a window or browser frame, padding, background and shadow to a screenshot, then export a full-resolution PNG. Free, private, runs in your browser.",
    faq: [
      {
        question: "Does this upload my screenshot?",
        answer: "No. The image is drawn on a canvas in your browser and the PNG is created on your device.",
      },
      {
        question: "Can I export with a transparent background?",
        answer: "Yes. Choose None (transparent) as the background and the PNG keeps transparent areas outside the window.",
      },
      {
        question: "Will the output be lower resolution than my screenshot?",
        answer: "No. The screenshot is drawn at its original pixel size, and the frame and padding are added around it.",
      },
      {
        question: "Can I add arrows or blur as well?",
        answer:
          "Mark up and redact first in the free screenshot editor on this site, export the PNG, then open it here to frame it.",
      },
    ],
    related: ["screenshot-window-without-shadow-mac", "how-to-screenshot-on-mac", "best-screenshot-apps-mac-2027"],
  },
];

export const toolHref = (t: ToolEntry) => t.href ?? `/tools/${t.slug}`;
export const publishedTools = () => TOOLS.filter((t) => !t.draft);
export function getTool(slug: string) {
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) throw new Error(`Unknown tool: ${slug}`);
  return tool;
}
