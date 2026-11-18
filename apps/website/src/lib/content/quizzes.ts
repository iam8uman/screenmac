/**
 * Data-driven quizzes, built by src/app/quiz/[slug]/page.tsx. Each answer adds points to
 * outcomes; the top outcome wins and the runner-up is shown too. Outcome hrefs must be real pages.
 */
import type { Faq } from "./tools";

export interface QuizOutcome {
  id: string;
  name: string;
  what: string;
  href: string;
  hrefLabel: string;
}
export interface QuizQuestion {
  question: string;
  options: { label: string; to: Record<string, number> }[];
}
export interface Quiz {
  slug: string;
  name: string;
  card: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
  questions: QuizQuestion[];
  outcomes: QuizOutcome[];
  faq: Faq[];
  draft?: boolean;
}

export const QUIZZES: Quiz[] = [
  {
    slug: "which-mac-screenshot-tool",
    name: "Which Mac Screenshot Tool Do You Need?",
    card: "Six questions to find out whether the built-in tools are enough or which kind of app fits.",
    intro:
      "macOS has a good screenshot tool built in, and many people never need more. Answer six questions about how you capture and share to see whether the built-in tool, a free annotation app or a full capture suite fits you best.",
    seoTitle: "Which Mac Screenshot Tool Do You Need? Free Quiz",
    seoDescription:
      "Six quick questions show whether the built-in Mac screenshot tool is enough, or whether a free annotation app or a full capture suite suits how you work.",
    questions: [
      {
        question: "How often do you take screenshots?",
        options: [
          { label: "A few times a month", to: { builtin: 3 } },
          { label: "Most days", to: { annotate: 2, suite: 1 } },
          { label: "Constantly, it is part of my job", to: { suite: 2, annotate: 1 } },
        ],
      },
      {
        question: "What happens to a screenshot after you take it?",
        options: [
          { label: "I paste it straight into a chat or document", to: { builtin: 2, annotate: 1 } },
          { label: "I add arrows, boxes or text first", to: { annotate: 3 } },
          { label: "I upload it and share a link", to: { suite: 3 } },
        ],
      },
      {
        question: "Do your screenshots ever show private information?",
        options: [
          { label: "Often: emails, names, tokens, customer data", to: { annotate: 3 } },
          { label: "Sometimes", to: { annotate: 1, builtin: 1 } },
          { label: "Rarely", to: { builtin: 1, suite: 1 } },
        ],
      },
      {
        question: "Do you record your screen too?",
        options: [
          { label: "No", to: { builtin: 2 } },
          { label: "Short clips now and then", to: { annotate: 2, builtin: 1 } },
          { label: "Yes, tutorials and demos with my voice", to: { suite: 2, annotate: 1 } },
        ],
      },
      {
        question: "Do you need scrolling captures of long pages?",
        options: [
          { label: "Yes, regularly", to: { suite: 3 } },
          { label: "No", to: { builtin: 1, annotate: 1 } },
        ],
      },
      {
        question: "How do you feel about paying for a screenshot app?",
        options: [
          { label: "Free only", to: { builtin: 2, annotate: 2 } },
          { label: "Happy to pay for the right tool", to: { suite: 2 } },
        ],
      },
    ],
    outcomes: [
      {
        id: "builtin",
        name: "The built-in tool is enough",
        what: "Shift-Command-3, 4 and 5 cover full screen, area, window and recording. Learn the shortcuts and the Options menu before installing anything.",
        href: "/tools/mac-screenshot-shortcuts",
        hrefLabel: "Find your shortcut",
      },
      {
        id: "annotate",
        name: "A free capture and annotation app",
        what: "You mark up most captures and sometimes hide private details. A native app with a fast editor and real redaction, such as Screenmac, saves the trip through Preview.",
        href: "/download",
        hrefLabel: "Get Screenmac free",
      },
      {
        id: "suite",
        name: "A full capture suite",
        what: "Scrolling capture, cloud links and long voice-over recordings point to a paid suite. Our comparisons say which one fits, including when it is not Screenmac.",
        href: "/blog/topics/alternatives",
        hrefLabel: "Read the comparisons",
      },
    ],
    faq: [
      {
        question: "Is my answer stored anywhere?",
        answer: "No. The result is worked out in your browser and nothing is sent.",
      },
      {
        question: "Can I try annotating without installing anything?",
        answer: "Yes. The free screenshot editor on this site runs in the browser: open or paste an image, mark it up and export a PNG.",
      },
      {
        question: "Does the built-in Mac tool record the screen?",
        answer: "Yes. Shift-Command-5 shows buttons to record the entire screen or a selected portion.",
      },
    ],
  },
  {
    slug: "which-mac-screen-recorder",
    name: "Which Mac Screen Recorder Fits You?",
    card: "Five questions to match how you record (quick clips, tutorials, streams or shared links) to the right kind of recorder.",
    intro:
      "Your Mac already records the screen, and for many people that is all they need. Answer five questions about what you record and where it goes to see whether the built-in recorder, a light native app, a studio recorder such as OBS, or a cloud video tool fits you best.",
    seoTitle: "Which Mac Screen Recorder Fits You? Free Quiz",
    seoDescription:
      "Five quick questions match how you record to the built-in Mac recorder, a light native app, OBS-style studio software or a cloud video messaging tool.",
    questions: [
      {
        question: "What do you mostly record?",
        options: [
          { label: "Short clips to show a bug or a quick how-to", to: { builtin: 2, native: 2 } },
          { label: "Longer tutorials or product demos", to: { native: 2, studio: 1, cloud: 1 } },
          { label: "Live streams, games or multi-camera scenes", to: { studio: 4 } },
          { label: "Video messages to teammates instead of a meeting", to: { cloud: 4 } },
        ],
      },
      {
        question: "What happens to the video afterwards?",
        options: [
          { label: "I send the file or drop it in a chat", to: { builtin: 2, native: 2 } },
          { label: "I want a link that is ready the moment I stop", to: { cloud: 3 } },
          { label: "I edit it properly or upload it to YouTube", to: { studio: 2, native: 1 } },
        ],
      },
      {
        question: "Where should your recordings be stored?",
        options: [
          { label: "Only on my Mac", to: { builtin: 2, native: 2, studio: 1 } },
          { label: "In the cloud is fine, even preferred", to: { cloud: 3 } },
        ],
      },
      {
        question: "How much setup are you willing to do?",
        options: [
          { label: "None, it should just work", to: { builtin: 3, native: 1 } },
          { label: "A settings window is fine", to: { native: 2, cloud: 1 } },
          { label: "I like scenes, sources and audio mixers", to: { studio: 3 } },
        ],
      },
      {
        question: "Do you need to mark up screenshots as well?",
        options: [
          { label: "Yes, I take screenshots and annotate them often", to: { native: 3 } },
          { label: "No, video only", to: { builtin: 1, studio: 1, cloud: 1 } },
        ],
      },
    ],
    outcomes: [
      {
        id: "builtin",
        name: "The built-in recorder",
        what: "Shift-Command-5 records the whole screen or a selected part, with your microphone, and saves locally. Start there before installing anything.",
        href: "/blog/record-screen-mac",
        hrefLabel: "How to record your screen",
      },
      {
        id: "native",
        name: "A light native capture app",
        what: "You record short clips and also take and mark up screenshots. A native app that does both with its own shortcuts, such as Screenmac (MP4 with optional microphone, nothing uploaded), keeps it in one place.",
        href: "/download",
        hrefLabel: "Get Screenmac free",
      },
      {
        id: "studio",
        name: "A studio recorder such as OBS",
        what: "Scenes, multiple sources, audio mixing and streaming point to free, open-source OBS Studio. It takes time to learn but grows with you.",
        href: "/blog/best-free-screen-recorders-mac-2027",
        hrefLabel: "Compare free recorders",
      },
      {
        id: "cloud",
        name: "A cloud video messaging tool",
        what: "You want a shareable link the moment you stop, with viewers and comments. That is what tools like Loom are built for, with the trade-off that videos live on their servers.",
        href: "/blog/loom-alternative-mac",
        hrefLabel: "Loom and local alternatives",
      },
    ],
    faq: [
      {
        question: "Does a Mac have a built-in screen recorder?",
        answer: "Yes. Press Shift-Command-5 and choose to record the entire screen or a selected portion. QuickTime Player can record the screen too.",
      },
      {
        question: "Is my answer stored anywhere?",
        answer: "No. The result is worked out in your browser and nothing is sent.",
      },
      {
        question: "Can a Mac record internal audio?",
        answer:
          "Apple lists a system audio option in the Screenshot toolbar for macOS 27 Golden Gate or later. On earlier versions the built-in recorder captures a microphone only.",
      },
    ],
  },
  {
    slug: "screenshot-privacy-check",
    name: "Are Your Screenshots Leaking Private Data?",
    card: "Six questions about how you capture, hide and share screenshots, with the fixes for any weak spots.",
    intro:
      "A screenshot can expose more than you meant to share: a notification, a name in a tab, a token under a see-through box, or metadata in the file. Answer six questions about your habits to see where your screenshots are most exposed and what to change first.",
    seoTitle: "Are Your Screenshots Leaking Private Data? Quiz",
    seoDescription:
      "Six quick questions check how you capture, redact and share screenshots, then point you to the fixes: real pixel redaction, tighter captures and clean files.",
    questions: [
      {
        question: "How do you hide private details before sharing?",
        options: [
          { label: "I crop them out or use a tool that replaces the pixels", to: { safe: 3 } },
          { label: "I draw a box or highlighter over them in Markup", to: { redact: 3 } },
          { label: "I use a light blur", to: { redact: 2 } },
          { label: "I usually do not hide anything", to: { redact: 2, habits: 1 } },
        ],
      },
      {
        question: "What format do you share redacted images in?",
        options: [
          { label: "A flattened PNG or JPG", to: { safe: 2 } },
          { label: "A PDF or a layered design file", to: { redact: 3 } },
          { label: "I never checked", to: { redact: 1, habits: 1 } },
        ],
      },
      {
        question: "Do notifications show up while you capture or record?",
        options: [
          { label: "I turn on Do Not Disturb first", to: { safe: 2 } },
          { label: "Sometimes they appear", to: { habits: 3 } },
        ],
      },
      {
        question: "Do you capture the full screen or just what you need?",
        options: [
          { label: "Just the window or area I need", to: { safe: 2 } },
          { label: "Usually the full screen, with tabs, menu bar and other windows", to: { habits: 3 } },
        ],
      },
      {
        question: "Where do your screenshots go when you share them?",
        options: [
          { label: "Straight into a chat or email as a file", to: { safe: 1, metadata: 1 } },
          { label: "To a public link or social post", to: { metadata: 2, habits: 1 } },
          { label: "Into a ticket or document others can download", to: { metadata: 2 } },
        ],
      },
      {
        question: "Do you know what metadata your screenshot files carry?",
        options: [
          { label: "Yes, and I strip it when it matters", to: { safe: 2 } },
          { label: "No idea", to: { metadata: 3 } },
        ],
      },
    ],
    outcomes: [
      {
        id: "safe",
        name: "Your habits are solid",
        what: "You capture only what you need and replace pixels rather than covering them. Keep it up, and bookmark the free browser editor for times you are away from your own Mac.",
        href: "/editor",
        hrefLabel: "Open the screenshot editor",
      },
      {
        id: "redact",
        name: "Your redaction may be reversible",
        what: "Boxes drawn in editable files can be moved or deleted, and light blur can sometimes be read. Use redaction that is flattened into the pixels, then share a PNG.",
        href: "/blog/pixelate-vs-blur-vs-black-box",
        hrefLabel: "Which redaction is safe",
      },
      {
        id: "habits",
        name: "Too much ends up in the frame",
        what: "Full-screen captures and pop-up notifications are easy leaks. Capture a single window or area, and turn on Do Not Disturb before you record.",
        href: "/blog/redact-sensitive-info-screenshot",
        hrefLabel: "Redact before you share",
      },
      {
        id: "metadata",
        name: "Check what the file carries",
        what: "Mac screenshots include EXIF and XMP fields plus Finder attributes. Usually harmless, but worth stripping before you post publicly.",
        href: "/blog/remove-metadata-from-screenshot-mac",
        hrefLabel: "Remove screenshot metadata",
      },
    ],
    faq: [
      {
        question: "Is blurring enough to hide a password?",
        answer:
          "Not always. Light blur or coarse pixelation of short, predictable text can sometimes be reconstructed. A solid box flattened into the image, or cropping the text out, is the safe option.",
      },
      {
        question: "Is my answer stored anywhere?",
        answer: "No. The quiz runs in your browser and nothing is sent.",
      },
      {
        question: "Do Mac screenshots contain my location?",
        answer:
          "A screenshot saved by macOS Tahoe 26 that we inspected had no GPS data. It did carry a Screenshot comment in its EXIF and XMP fields and Finder attributes marking it as a screen capture.",
      },
    ],
  },
  {
    slug: "mac-screenshot-skills-quiz",
    name: "Mac Screenshot Skills Quiz",
    card: "Seven questions on Mac screenshot shortcuts and options. See where you stand and what to learn next.",
    intro:
      "How well do you know the Mac's screenshot tools? Seven questions cover shortcuts, the Screenshot app's options and what happens to the files. Your result points to the guide that fills your biggest gap.",
    seoTitle: "Mac Screenshot Skills Quiz: Test Your Shortcuts",
    seoDescription:
      "Seven questions test your Mac screenshot know-how: shortcuts, clipboard captures, window shadows, timers and save locations. See what to learn next.",
    questions: [
      {
        question: "Which shortcut opens the Screenshot app with every option?",
        options: [
          { label: "Shift-Command-5", to: { pro: 2 } },
          { label: "Shift-Command-3", to: { basics: 2 } },
          { label: "Command-Option-S", to: { basics: 2 } },
        ],
      },
      {
        question: "How do you copy a screenshot to the clipboard instead of saving a file?",
        options: [
          { label: "Add Control to the shortcut", to: { pro: 2 } },
          { label: "Add Option to the shortcut", to: { files: 2 } },
          { label: "Take it, then open it and copy", to: { files: 2 } },
        ],
      },
      {
        question: "How do you capture a window without its shadow?",
        options: [
          { label: "Shift-Command-4, Space, then Option-click the window", to: { pro: 2 } },
          { label: "Shift-Command-4 and drag tightly around it", to: { basics: 2 } },
          { label: "It is not possible with the built-in tools", to: { basics: 2 } },
        ],
      },
      {
        question: "Where are screenshots saved by default?",
        options: [
          { label: "The desktop", to: { pro: 1 } },
          { label: "The Pictures folder", to: { files: 2 } },
          { label: "The Photos library", to: { files: 2 } },
        ],
      },
      {
        question: "How would you capture an open menu that closes when you press keys?",
        options: [
          { label: "Use the timer in the Screenshot app's Options", to: { pro: 2 } },
          { label: "Take a photo of the screen with my phone", to: { basics: 2 } },
          { label: "I did not know menus could be captured", to: { basics: 2 } },
        ],
      },
      {
        question: "You drew a black box over a password in an editable file and shared that file. Is it hidden?",
        options: [
          { label: "Not necessarily: it should be flattened into the pixels first", to: { pro: 2 } },
          { label: "Yes, black covers everything", to: { privacy: 3 } },
        ],
      },
      {
        question: "How do you change where screenshots are saved?",
        options: [
          { label: "Shift-Command-5, Options, Save to", to: { pro: 2 } },
          { label: "System Settings, General", to: { files: 2 } },
          { label: "I move them by hand every time", to: { files: 2 } },
        ],
      },
    ],
    outcomes: [
      {
        id: "pro",
        name: "Screenshot pro",
        what: "You know the shortcuts and the options. The next step is speed: a capture app with its own shortcuts and an editor that opens straight after each capture.",
        href: "/blog/best-screenshot-apps-mac-2027",
        hrefLabel: "See the best screenshot apps",
      },
      {
        id: "basics",
        name: "Learning the shortcuts",
        what: "You know a shortcut or two. Learning area, window and clipboard captures will save you time every day.",
        href: "/blog/how-to-screenshot-on-mac",
        hrefLabel: "Every Mac screenshot shortcut",
      },
      {
        id: "files",
        name: "Taming the files",
        what: "Your captures are fine, but finding and moving them is a chore. Copy to the clipboard for chats, and set a dedicated folder for the rest.",
        href: "/blog/change-screenshot-location-mac",
        hrefLabel: "Change the save location",
      },
      {
        id: "privacy",
        name: "Watch your redactions",
        what: "Boxes in editable files can be moved or deleted. Make sure redaction is written into the pixels before you share.",
        href: "/blog/pixelate-vs-blur-vs-black-box",
        hrefLabel: "Which redaction is safe",
      },
    ],
    faq: [
      {
        question: "What is the most useful Mac screenshot shortcut?",
        answer: "Shift-Command-4 to drag over an area. Add Control to copy it to the clipboard instead of saving a file.",
      },
      {
        question: "Is my score saved?",
        answer: "No. The quiz runs in your browser and nothing is sent.",
      },
      {
        question: "Can I change the Mac screenshot shortcuts?",
        answer: "Yes. Open System Settings, Keyboard, Keyboard Shortcuts, then Screenshots, and set new keys for each action.",
      },
    ],
  },
];

export const quizPath = (slug: string) => `/quiz/${slug}`;
export const publishedQuizzes = () => QUIZZES.filter((q) => !q.draft);
