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
        href: "/blog",
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
];

export const quizPath = (slug: string) => `/quiz/${slug}`;
export const publishedQuizzes = () => QUIZZES.filter((q) => !q.draft);
