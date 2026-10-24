import { FAQS } from "@/components/landing/FAQ";
import { product } from "@/lib/product";

/**
 * JSON-LD for search engines and AI answer engines. Every value here is a fact the site already
 * states; there is no rating or review markup because Screenmac has no published reviews yet.
 */
function softwareApplication() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${product.siteUrl}/#app`,
    name: product.name,
    description: product.description,
    url: product.siteUrl,
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "Screenshot and screen recording",
    operatingSystem: `macOS ${product.minimumMacOS} or later`,
    processorRequirements: "Apple silicon or Intel (universal build)",
    softwareVersion: product.version,
    downloadUrl: product.downloadUrl ?? product.releasesUrl,
    installUrl: `${product.siteUrl}/#install`,
    releaseNotes: product.releasesUrl,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
    featureList: [
      "Area, window and full-screen capture",
      "Global keyboard shortcuts",
      "Annotation editor with arrows, shapes, text, numbered steps, highlighter and crop",
      "Redact, blur and pixelate flattened into the exported image",
      "Screen recording to MP4 with optional microphone",
      "Quick Access preview to copy, save or drag a capture",
      "Local capture history; no account and no uploads",
    ],
    screenshot: `${product.siteUrl}/opengraph-image.png`,
    image: `${product.siteUrl}/icon.png`,
    author: { "@type": "Person", name: "Suman Sharma", url: "https://github.com/iam8uman" },
    codeRepository: product.repoUrl,
  };
}

function website() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${product.siteUrl}/#website`,
    name: product.name,
    url: product.siteUrl,
    about: { "@id": `${product.siteUrl}/#app` },
  };
}

function faqPage() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.plain ?? (typeof item.a === "string" ? item.a : "") },
    })).filter((q) => q.acceptedAnswer.text),
  };
}

function JsonLd({ data }: { data: object }) {
  // JSON.stringify output is safe here except for "</script>", which can't appear in this data; escape "<" anyway.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function HomeStructuredData() {
  return (
    <>
      <JsonLd data={softwareApplication()} />
      <JsonLd data={website()} />
      <JsonLd data={faqPage()} />
    </>
  );
}

export function DownloadStructuredData() {
  return <JsonLd data={softwareApplication()} />;
}
