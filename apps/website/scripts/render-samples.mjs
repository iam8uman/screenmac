#!/usr/bin/env node
/**
 * Renders the editor's sample screenshots from original HTML mockups.
 *
 *   node scripts/render-samples.mjs
 *
 * Output: public/samples/*.png at 1600×1000. The data in these mockups is
 * fictional. Set CHROMIUM_PATH to use a specific Chromium binary.
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const fonts = path.join(root, "node_modules/geist/dist/fonts");
const out = path.join(root, "public/samples");

const inline = async (file) => `data:font/woff2;base64,${(await readFile(path.join(fonts, file))).toString("base64")}`;
const fontFace = `
@font-face { font-family: Geist; src: url("${await inline("geist-sans/Geist-Variable.woff2")}") format("woff2"); font-weight: 100 900; }
@font-face { font-family: GeistMono; src: url("${await inline("geist-mono/GeistMono-Variable.woff2")}") format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1200px; height: 750px; overflow: hidden; }
body { font-family: Geist, sans-serif; -webkit-font-smoothing: antialiased; }
`;

const codeReview = `
<style>${fontFace}
body { background: #0F1016; color: #D6D8E4; display: grid; grid-template-columns: 210px 1fr; }
.side { background: #0B0C11; border-right: 1px solid #1E2030; padding: 14px 10px; font-size: 12.5px; }
.lights { display:flex; gap:7px; padding: 2px 6px 16px; } .lights i { width:12px; height:12px; border-radius:50%; display:block; }
.side h6 { font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color:#646882; margin: 6px 8px 8px; font-weight:600 }
.f { padding: 5px 8px; border-radius: 6px; color:#9DA1B8; display:flex; gap:8px; align-items:center }
.f.on { background:#1A1C2A; color:#E8E9F3 } .f b { width:8px; height:8px; border-radius:2px; display:inline-block }
.main { display:flex; flex-direction:column; min-width:0 }
.tabs { height: 40px; display:flex; align-items:end; gap:2px; padding: 0 10px; border-bottom:1px solid #1E2030; background:#0B0C11 }
.tab { padding: 9px 14px; font-size:12.5px; color:#80849C; border-radius: 8px 8px 0 0 }
.tab.on { background:#0F1016; color:#E8E9F3; border:1px solid #1E2030; border-bottom-color:#0F1016; margin-bottom:-1px }
pre { font-family: GeistMono, monospace; font-size: 13.4px; line-height: 23px; padding: 16px 0; flex:1; white-space: normal }
.l > span:last-child { white-space: pre }
.l { display:flex } .n { width: 52px; text-align:right; padding-right: 18px; color:#3E4158 } .err { background: rgba(240,68,58,.10); box-shadow: inset 3px 0 #F0443A }
.k{color:#C79BFF}.s{color:#9BE28B}.t{color:#7CC7FF}.c{color:#5B6080;font-style:italic}.fn{color:#FFD479}.nm{color:#FF9E7A}
.squig { text-decoration: underline wavy #F0443A; text-underline-offset: 5px }
.panel { height: 178px; border-top:1px solid #1E2030; background:#0B0C11; padding: 12px 18px; font-family: GeistMono, monospace; font-size: 12.5px; line-height: 21px }
.panel .h { font-family: Geist; font-size: 11px; letter-spacing:.08em; text-transform:uppercase; color:#646882; margin-bottom:8px; display:flex; gap:18px }
.panel .h span.on { color:#E8E9F3; border-bottom: 2px solid #6D6BFF; padding-bottom: 6px }
.red{color:#FF6B60}.dim{color:#646882}.grn{color:#58D39A}
</style>
<div class="side">
  <div class="lights"><i style="background:#FF5F57"></i><i style="background:#FEBC2E"></i><i style="background:#28C840"></i></div>
  <h6>Explorer</h6>
  <div class="f"><b style="background:#6D6BFF"></b>Sources</div>
  <div class="f" style="padding-left:22px">CaptureSession.swift</div>
  <div class="f on" style="padding-left:22px">RegionSelector.swift</div>
  <div class="f" style="padding-left:22px">QuickAccessPanel.swift</div>
  <div class="f" style="padding-left:22px">Exporter.swift</div>
  <div class="f"><b style="background:#19C08A"></b>Tests</div>
  <div class="f" style="padding-left:22px">RegionSelectorTests.swift</div>
  <div class="f"><b style="background:#FFB020"></b>Config</div>
  <div class="f" style="padding-left:22px">Secrets.xcconfig</div>
</div>
<div class="main">
  <div class="tabs"><div class="tab on">RegionSelector.swift</div><div class="tab">Exporter.swift</div><div class="tab">Secrets.xcconfig</div></div>
<pre>
<div class="l"><span class="n">12</span><span><span class="k">struct</span> <span class="t">RegionSelector</span> {</span></div>
<div class="l"><span class="n">13</span><span>    <span class="k">let</span> displayBounds: <span class="t">CGRect</span></span></div>
<div class="l"><span class="n">14</span><span>    <span class="k">let</span> uploadToken = <span class="s">"ffk_live_9QxT2mLw7Rr4Vb81sKpZ"</span>   <span class="c">// TODO: move to keychain</span></span></div>
<div class="l"><span class="n">15</span><span></span></div>
<div class="l"><span class="n">16</span><span>    <span class="c">/// Clamp a drag rectangle to the active display.</span></span></div>
<div class="l"><span class="n">17</span><span>    <span class="k">func</span> <span class="fn">clamp</span>(<span class="k">_</span> rect: <span class="t">CGRect</span>) -> <span class="t">CGRect</span> {</span></div>
<div class="l"><span class="n">18</span><span>        <span class="k">let</span> x = <span class="fn">max</span>(rect.minX, displayBounds.minX)</span></div>
<div class="l"><span class="n">19</span><span>        <span class="k">let</span> y = <span class="fn">max</span>(rect.minY, displayBounds.minY)</span></div>
<div class="l err"><span class="n">20</span><span>        <span class="k">let</span> w = <span class="squig"><span class="fn">min</span>(rect.width, displayBounds.width)</span></span></div>
<div class="l"><span class="n">21</span><span>        <span class="k">let</span> h = <span class="fn">min</span>(rect.height, displayBounds.height)</span></div>
<div class="l"><span class="n">22</span><span>        <span class="k">return</span> <span class="t">CGRect</span>(x: x, y: y, width: w, height: h)</span></div>
<div class="l"><span class="n">23</span><span>    }</span></div>
<div class="l"><span class="n">24</span><span></span></div>
<div class="l"><span class="n">25</span><span>    <span class="k">func</span> <span class="fn">scaled</span>(<span class="k">_</span> rect: <span class="t">CGRect</span>, by factor: <span class="t">CGFloat</span> = <span class="nm">2.0</span>) -> <span class="t">CGRect</span> {</span></div>
<div class="l"><span class="n">26</span><span>        rect.<span class="fn">applying</span>(.<span class="fn">init</span>(scaleX: factor, y: factor))</span></div>
<div class="l"><span class="n">27</span><span>    }</span></div>
<div class="l"><span class="n">28</span><span>}</span></div>
</pre>
  <div class="panel">
    <div class="h"><span class="on">Test results</span><span>Console</span><span>Problems · 1</span></div>
    <div><span class="red">✕</span> RegionSelectorTests.<span style="color:#E8E9F3">testDragPastRightEdgeIsClamped</span> <span class="dim">(0.004s)</span></div>
    <div class="dim">  XCTAssertEqual failed: ("(1240.0, 80.0, 680.0, 400.0)") is not equal to ("(1240.0, 80.0, 200.0, 400.0)")</div>
    <div class="dim">  Width is clamped to the display, not to the space left after the origin.</div>
    <div><span class="grn">✓</span> RegionSelectorTests.testSelectionInsideDisplayIsUnchanged <span class="dim">(0.001s)</span></div>
    <div><span class="grn">✓</span> RegionSelectorTests.testRetinaScaling <span class="dim">(0.001s)</span></div>
  </div>
</div>`;

const bars = [62, 70, 66, 78, 84, 81, 88, 92, 47, 52, 58, 61];
const metrics = `
<style>${fontFace}
body { background: #F6F6F9; color: #17171F; display:grid; grid-template-columns: 200px 1fr; }
.side { background:#FFFFFF; border-right:1px solid #E7E7EE; padding: 18px 12px; font-size: 13px }
.brand { display:flex; gap:9px; align-items:center; font-weight:650; padding: 0 8px 18px } .brand i { width:22px; height:22px; border-radius:7px; background: linear-gradient(135deg,#19C08A,#2E9BFF); display:block }
.nav { padding: 8px 10px; border-radius: 8px; color:#5D5D6E; margin-bottom: 2px } .nav.on { background:#F0F0F6; color:#17171F; font-weight:550 }
.main { padding: 22px 26px; display:flex; flex-direction:column; gap: 16px }
.top { display:flex; justify-content:space-between; align-items:center } h1 { font-size: 20px; font-weight:650; letter-spacing:-.01em }
.pill { font-size: 12px; border:1px solid #E1E1EA; background:#fff; padding: 6px 10px; border-radius: 8px; color:#5D5D6E }
.cards { display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px }
.card { background:#fff; border:1px solid #E7E7EE; border-radius: 12px; padding: 14px 16px }
.card .lb { font-size: 12px; color:#73738A } .card .v { font-size: 24px; font-weight: 650; margin-top: 6px; letter-spacing:-.02em } .card .d { font-size: 12px; margin-top: 4px }
.up { color:#11996E } .down { color:#D9372D }
.chart { background:#fff; border:1px solid #E7E7EE; border-radius: 12px; padding: 16px 18px; display:flex; flex-direction:column; gap: 12px }
.bars { display:flex; align-items:end; gap: 14px; height: 150px; border-bottom: 1px solid #ECECF2; padding: 0 6px }
.bar { flex:1; border-radius: 6px 6px 2px 2px; background: #C9C8FF } .bar.hot { background:#5B5BF6 } .bar.drop { background:#FFB4AE }
.months { display:flex; gap: 14px; padding: 0 6px; font-size: 11px; color:#8A8AA0 } .months span { flex:1; text-align:center }
table { width:100%; border-collapse: collapse; font-size: 12.5px } th { text-align:left; color:#73738A; font-weight:500; padding: 8px 10px; border-bottom:1px solid #ECECF2 } td { padding: 9px 10px; border-bottom: 1px solid #F2F2F6 }
.tbl { background:#fff; border:1px solid #E7E7EE; border-radius: 12px; padding: 6px 8px }
.av { display:inline-block; width:20px; height:20px; border-radius:50%; vertical-align:middle; margin-right:8px }
</style>
<div class="side">
  <div class="brand"><i></i>Northwind</div>
  <div class="nav">Overview</div><div class="nav on">Activation</div><div class="nav">Retention</div><div class="nav">Revenue</div><div class="nav">Customers</div><div class="nav">Settings</div>
</div>
<div class="main">
  <div class="top"><h1>Activation funnel</h1><div style="display:flex;gap:8px"><span class="pill">Last 12 weeks</span><span class="pill">All plans</span></div></div>
  <div class="cards">
    <div class="card"><div class="lb">Trial starts</div><div class="v">4,812</div><div class="d up">+8.2% vs prior</div></div>
    <div class="card"><div class="lb">Completed onboarding</div><div class="v">61.4%</div><div class="d down">−19.6 pts since v3.2</div></div>
    <div class="card"><div class="lb">First capture shared</div><div class="v">2,140</div><div class="d down">−11.0% vs prior</div></div>
    <div class="card"><div class="lb">Median time to value</div><div class="v">3m 42s</div><div class="d up">−24s vs prior</div></div>
  </div>
  <div class="chart">
    <div style="display:flex;justify-content:space-between;font-size:13px"><b style="font-weight:600">Weekly onboarding completion</b><span style="color:#73738A">Release v3.2 shipped in week 9</span></div>
    <div class="bars">${bars.map((h, i) => `<div class="bar ${i === 7 ? "hot" : i >= 8 ? "drop" : ""}" style="height:${h}%"></div>`).join("")}</div>
    <div class="months">${bars.map((_, i) => `<span>W${i + 1}</span>`).join("")}</div>
  </div>
  <div class="tbl"><table>
    <tr><th>Account</th><th>Owner</th><th>Stalled at</th><th>Plan</th></tr>
    <tr><td><span class="av" style="background:#FFD7A8"></span>Halcyon Labs</td><td>maria.lindqvist@halcyonlabs.io</td><td>Grant screen recording</td><td>Team</td></tr>
    <tr><td><span class="av" style="background:#BFE8FF"></span>Oakridge Studio</td><td>dev.patel@oakridge.design</td><td>Grant screen recording</td><td>Pro</td></tr>
    <tr><td><span class="av" style="background:#D6CCFF"></span>Brightline</td><td>j.okafor@brightline.app</td><td>Choose save folder</td><td>Pro</td></tr>
  </table></div>
</div>`;

const chat = `
<style>${fontFace}
body { background:#FBFAF7; color:#1C1B22; display:grid; grid-template-columns: 220px 1fr 300px; }
.side { background:#1F1D2B; color:#C8C6D8; padding: 16px 12px; font-size: 13px }
.ws { color:#fff; font-weight:650; font-size: 15px; padding: 2px 8px 16px }
.ch { padding: 6px 10px; border-radius: 7px; margin-bottom: 1px } .ch.on { background:#3C3A55; color:#fff }
.sec { font-size: 11px; letter-spacing:.06em; text-transform:uppercase; color:#8E8BA6; margin: 14px 10px 6px }
.thread { display:flex; flex-direction:column; border-right:1px solid #ECEAE3 }
.head { height: 54px; border-bottom:1px solid #ECEAE3; display:flex; align-items:center; padding: 0 20px; font-weight:650; font-size: 15px; gap: 8px }
.msgs { flex:1; padding: 16px 20px; display:flex; flex-direction:column; gap: 18px; font-size: 13.6px; line-height: 1.5 }
.m { display:flex; gap: 11px } .a { width: 34px; height: 34px; border-radius: 9px; flex: none }
.who { font-weight: 650 } .when { color:#9A978C; font-weight:400; font-size: 12px; margin-left: 6px }
.shot { margin-top: 8px; width: 360px; height: 150px; border-radius: 10px; border:1px solid #E5E2D8; background: linear-gradient(#fff,#fff) padding-box; overflow:hidden; display:grid; grid-template-columns: 1fr 1fr }
.shot div { padding: 12px } .shot .l { background:#F3F1FF } .shot .ln { height: 8px; border-radius: 4px; background:#DAD7F0; margin-bottom: 8px }
.compose { margin: 0 20px 18px; border:1px solid #E1DED4; border-radius: 12px; padding: 12px 14px; color:#9A978C; font-size: 13px; background:#fff }
.info { padding: 18px; font-size: 13px; display:flex; flex-direction:column; gap: 14px }
.info h4 { font-size: 12px; text-transform:uppercase; letter-spacing:.06em; color:#8A877C; font-weight:600 }
.kv { display:flex; justify-content:space-between; padding: 7px 0; border-bottom: 1px solid #EFEDE6 } .kv span:first-child { color:#77746A }
.tag { display:inline-block; font-size: 11.5px; padding: 3px 8px; border-radius: 999px; background:#FFF1DB; color:#9A5B00; font-weight:550 }
</style>
<div class="side">
  <div class="ws">Lumen Design</div>
  <div class="sec">Channels</div>
  <div class="ch"># general</div><div class="ch on"># design-review</div><div class="ch"># ios-release</div><div class="ch"># support-escalations</div>
  <div class="sec">Direct messages</div>
  <div class="ch">Aiko Tanaka</div><div class="ch">Ravi Menon</div><div class="ch">Sofia Duarte</div>
</div>
<div class="thread">
  <div class="head"># design-review <span style="font-weight:400;color:#9A978C;font-size:13px">· Checkout v2 feedback</span></div>
  <div class="msgs">
    <div class="m"><div class="a" style="background:#FFC9B5"></div><div><div class="who">Aiko Tanaka<span class="when">10:42</span></div>The new payment step feels crowded on 13" screens. The promo field pushes the primary button below the fold.</div></div>
    <div class="m"><div class="a" style="background:#B9E3D3"></div><div><div class="who">Ravi Menon<span class="when">10:47</span></div>Agreed. Also the card number field and the expiry field don't line up — 6px off at 1280 wide.<div class="shot"><div class="l"><div class="ln" style="width:70%"></div><div class="ln"></div><div class="ln" style="width:55%"></div></div><div><div class="ln" style="width:40%;background:#E9E6DC"></div><div class="ln" style="background:#E9E6DC"></div><div class="ln" style="width:80%;background:#5B5BF6;height:22px;border-radius:7px;margin-top:20px"></div></div></div></div></div>
    <div class="m"><div class="a" style="background:#D6CCFF"></div><div><div class="who">Sofia Duarte<span class="when">10:51</span></div>I'll send an annotated capture after standup. Test card for staging is 4242 4242 4242 4242, exp 09/29, CVC 314.</div></div>
  </div>
  <div class="compose">Message #design-review</div>
</div>
<div class="info">
  <h4>Ticket</h4>
  <div><span class="tag">In review</span></div>
  <div><div class="kv"><span>ID</span><span>CHK-2291</span></div><div class="kv"><span>Reporter</span><span>Aiko Tanaka</span></div><div class="kv"><span>Customer</span><span>sam.r@harborpay.co</span></div><div class="kv"><span>Viewport</span><span>1280 × 800</span></div><div class="kv"><span>Build</span><span>web 2026.10.3</span></div></div>
  <h4>Checklist</h4>
  <div style="line-height:1.9">☑ Reproduce on Safari<br/>☐ Fix field alignment<br/>☐ Move promo field<br/>☐ Re-test checkout</div>
</div>`;

const samples = [
  ["code-review", codeReview],
  ["metrics", metrics],
  ["design-review", chat],
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 750 }, deviceScaleFactor: 4 / 3 });
await mkdir(out, { recursive: true });
for (const [name, html] of samples) {
  await page.setContent(`<!doctype html><meta charset="utf-8">${html}`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, `${name}.png`), clip: { x: 0, y: 0, width: 1200, height: 750 } });
  console.log(`rendered ${name}.png`);
}
await browser.close();
