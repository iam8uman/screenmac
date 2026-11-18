/* Footer terminal: types the install command, then replays what the installer prints.
   The markup already holds the finished run, so without JS (or with reduced motion) it simply shows that. */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  document.querySelectorAll("[data-ft-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.getAttribute("data-ft-copy"));
        btn.textContent = "Copied";
      } catch (e) {
        btn.textContent = "Press ⌘C";
      }
      setTimeout(() => { btn.textContent = "Copy"; }, 1600);
    });
  });

  document.querySelectorAll("[data-ft-term]").forEach((term) => {
    const screen = term.querySelector(".ft-screen");
    const lines = [...screen.children];
    const typed = term.querySelector(".ft-typed");
    const full = typed.getAttribute("data-text") || typed.textContent;
    const prog = term.querySelector(".ft-prog");
    const pct = term.querySelector(".ft-pct");

    // curl --progress-bar fills the row with # signs, so size the bar to the window.
    const barCols = () => {
      const probe = document.createElement("span");
      probe.textContent = "#".repeat(10);
      probe.style.visibility = "hidden";
      screen.appendChild(probe);
      const cw = probe.getBoundingClientRect().width / 10 || 7.5;
      probe.remove();
      const inner = screen.clientWidth - parseFloat(getComputedStyle(screen).paddingLeft) * 2;
      return Math.max(12, Math.floor(inner / cw) - 9);
    };
    const fill = (p) => {
      if (!prog) return;
      prog.textContent = "#".repeat(Math.round((barCols() * p) / 100));
      pct.textContent = p.toFixed(1) + "%";
    };
    fill(100);
    if (reduce) return;

    let run = 0;
    async function play() {
      const id = ++run;
      const alive = () => id === run;
      screen.style.minHeight = "";
      lines.forEach((l) => { l.hidden = false; });
      screen.style.minHeight = screen.offsetHeight + "px"; // hold the size so the page never jumps
      lines.forEach((l, i) => { l.hidden = i > 0; });
      typed.textContent = "";
      term.classList.add("ft-playing");
      await sleep(400);
      for (let i = 1; i <= full.length; i++) {
        if (!alive()) return;
        typed.textContent = full.slice(0, i);
        await sleep(full[i - 1] === " " ? 70 : 18 + Math.random() * 34);
      }
      await sleep(420);
      for (const l of lines.slice(1)) {
        if (!alive()) return;
        l.hidden = false;
        if (l.classList.contains("ft-progress")) {
          for (let p = 0; p < 100; p += 1.5 + Math.random() * 5) {
            if (!alive()) return;
            fill(p);
            await sleep(38);
          }
          fill(100);
          await sleep(260);
        } else if (l.classList.contains("ft-ban")) {
          await sleep(65);
        } else {
          await sleep(l.textContent.trim() ? 420 : 40);
        }
      }
      term.classList.remove("ft-playing");
    }

    const replay = term.querySelector("[data-ft-replay]");
    if (replay) replay.addEventListener("click", play);

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { io.disconnect(); play(); }
      }, { threshold: 0.35 });
      io.observe(term);
    }
  });
})();
