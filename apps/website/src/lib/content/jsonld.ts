import { product } from "@/lib/product";
import { AUTHOR, absoluteUrl } from "./site";

const author = { "@type": "Person", "@id": `${product.siteUrl}/#author`, name: AUTHOR.name, url: AUTHOR.url };

export const breadcrumbJsonLd = (crumbs: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
});

export const faqJsonLd = (faq: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
});

export const articleJsonLd = (p: { title: string; description: string; path: string; publishedAt: Date; updatedAt?: Date; type: string }) => {
  const url = absoluteUrl(p.path);
  return {
    "@context": "https://schema.org",
    "@type": p.type === "how-to" || p.type === "troubleshooting" ? "TechArticle" : "BlogPosting",
    "@id": `${url}#article`,
    headline: p.title,
    description: p.description,
    url,
    mainEntityOfPage: url,
    image: absoluteUrl("/opengraph-image.png"),
    datePublished: p.publishedAt.toISOString(),
    dateModified: (p.updatedAt ?? p.publishedAt).toISOString(),
    inLanguage: "en",
    author,
    publisher: author,
    isPartOf: { "@id": `${product.siteUrl}/#website` },
    about: { "@id": `${product.siteUrl}/#app` },
  };
};

export const webAppJsonLd = (p: { name: string; description: string; path: string }) => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: p.name,
  description: p.description,
  url: absoluteUrl(p.path),
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any (runs in the browser)",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author,
});

export const itemListJsonLd = (name: string, items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: absoluteUrl(it.path) })),
});
