import Script from "next/script";
import { product } from "@/lib/product";
import "./footer-install.css";

/* What install.sh prints, line for line (banner included). foot-term.js types the command and
   replays these lines when the terminal scrolls into view; without JS it shows the finished run. */
const transcript = "<span class=\"ft-l ft-in\"><span class=\"ft-ps\">~ %</span> <span class=\"ft-typed\" data-text=\"curl -fsSL https://www.screenmac.app/install.sh | bash\">curl -fsSL https://www.screenmac.app/install.sh | bash</span></span><span class=\"ft-l\"> </span><span class=\"ft-l ft-ban\" style=\"--c:#5F5FFF;--cols:79\">  ███████╗ ██████╗██████╗ ███████╗███████╗███╗   ██╗███╗   ███╗ █████╗  ██████╗</span><span class=\"ft-l ft-ban\" style=\"--c:#5F87FF;--cols:79\">  ██╔════╝██╔════╝██╔══██╗██╔════╝██╔════╝████╗  ██║████╗ ████║██╔══██╗██╔════╝</span><span class=\"ft-l ft-ban\" style=\"--c:#8787FF;--cols:79\">  ███████╗██║     ██████╔╝█████╗  █████╗  ██╔██╗ ██║██╔████╔██║███████║██║</span><span class=\"ft-l ft-ban\" style=\"--c:#AF87FF;--cols:79\">  ╚════██║██║     ██╔══██╗██╔══╝  ██╔══╝  ██║╚██╗██║██║╚██╔╝██║██╔══██║██║</span><span class=\"ft-l ft-ban\" style=\"--c:#D787FF;--cols:79\">  ███████║╚██████╗██║  ██║███████╗███████╗██║ ╚████║██║ ╚═╝ ██║██║  ██║╚██████╗</span><span class=\"ft-l ft-ban\" style=\"--c:#FF87FF;--cols:79\">  ╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝</span><span class=\"ft-l\"> </span><span class=\"ft-l ft-dim\">  Screenshots and screen recordings for your Mac</span><span class=\"ft-l\"> </span><span class=\"ft-l\">  <b class=\"ft-step\">→</b> Downloading the latest Screenmac (about 2 MB)…</span><span class=\"ft-l ft-progress\"><span class=\"ft-prog\">########################################</span> <span class=\"ft-pct\">100.0%</span></span><span class=\"ft-l\">  <b class=\"ft-ok\">✓</b> Downloaded</span><span class=\"ft-l\">  <b class=\"ft-ok\">✓</b> Checksum verified</span><span class=\"ft-l\">  <b class=\"ft-step\">→</b> Installing…</span><span class=\"ft-l\">  <b class=\"ft-ok\">✓</b> Installed Screenmac to /Applications/Screenmac.app</span><span class=\"ft-l\"> </span><span class=\"ft-l\">  Press <b class=\"ft-b\">⌥⇧⌘4</b> to capture an area. Enjoy!</span><span class=\"ft-l\"> </span><span class=\"ft-l ft-in\"><span class=\"ft-ps\">~ %</span> <span class=\"ft-caret\"></span></span>";

export function FooterInstall() {
  return (
    <section className="ft" aria-labelledby="ft-title">
      <div className="ft-band">
        <div className="ft-copy">
          <p className="ft-eyebrow">
            <span className="ft-dot" aria-hidden="true" />
            Install from Terminal
          </p>
          <h2 className="ft-title" id="ft-title">
            One line. <em>About 10 sec.</em>
          </h2>
          <p className="ft-sub">
            Paste this into Terminal. It downloads the latest Screenmac from GitHub, checks it and puts it in
            Applications.
          </p>
          <div className="ft-cmd">
            <code>{product.installCommand}</code>
            <button type="button" className="ft-copy-btn" data-ft-copy={product.installCommand}>
              Copy
            </button>
          </div>
        </div>
        <figure className="ft-term" data-ft-term aria-label="What the Screenmac installer prints">
          <div className="ft-bar">
            <i />
            <i />
            <i />
            <span>zsh — ~</span>
            <button type="button" className="ft-replay" data-ft-replay>
              Replay
            </button>
          </div>
          <pre className="ft-screen" aria-hidden="true" dangerouslySetInnerHTML={{ __html: transcript }} />
        </figure>
      </div>
      <Script src="/foot-term.js" strategy="lazyOnload" />
    </section>
  );
}

export function FooterWordmark() {
  return (
    <div className="ft-mark-wrap" aria-hidden="true">
      <p className="ft-mark">Screenmac</p>
    </div>
  );
}
