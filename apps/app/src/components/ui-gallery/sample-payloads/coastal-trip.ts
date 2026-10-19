import { DEMO_EXAMPLES } from "@/components/demo-gallery/demo-data";
import { RECONSTRUCTED_LABEL, type GallerySample } from "./types";

const PROMPT = DEMO_EXAMPLES.find((item) => item.id === "map")?.prompt ?? "";

const CSS = `
.tr { font-family: var(--font-sans); color: var(--color-text-primary); display: grid; gap: 10px; max-width: 640px; }
.tr-head { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: flex-start; }
.tr h2 { font-size: 18px; font-weight: 500; line-height: 1.3; }
.tr-sub { font-size: 13px; color: var(--color-text-secondary); }
.tr-chips { display: flex; gap: 6px; }
.tr-chip { padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 500; background: var(--color-background-tertiary); color: var(--color-text-secondary); white-space: nowrap; }
.tr-status { font-size: 13px; color: var(--color-text-secondary); }
.tr-status.is-error { color: var(--color-text-danger); }
.tr-map { height: 300px; border-radius: var(--border-radius-lg); overflow: hidden; background: var(--color-background-tertiary); border: 0.5px solid var(--color-border-tertiary); }
.tr-pin { background: transparent; border: 0; }
.pin-dot { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; font-size: 12px; font-weight: 500; background: var(--color-background-primary); color: var(--color-text-primary); border: 1.5px solid var(--color-text-primary); opacity: 0; }
.pin-dot.is-active { background: var(--color-text-info); color: var(--color-background-primary); border-color: var(--color-text-info); }
.tr-legend { font-size: 12px; color: var(--color-text-tertiary); }
.tr-actions { display: flex; gap: 8px; }
.tr-strip { list-style: none; padding: 0 0 6px; display: flex; gap: 8px; overflow-x: auto; scroll-snap-type: x proximity; }
.tr-card { flex: 0 0 180px; scroll-snap-align: start; text-align: left; display: grid; gap: 2px; padding: 10px 12px; border-radius: var(--border-radius-lg); background: var(--color-background-secondary); border: 0.5px solid var(--color-border-tertiary); font-size: 13px; line-height: 1.4; }
.tr-card[aria-current="step"] { border-color: var(--color-text-info); box-shadow: 0 0 0 2px var(--color-background-info); }
.tr-num { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-tertiary); }
.tr-name { font-weight: 500; }
.tr-day { font-size: 12px; color: var(--color-text-info); }
.tr-desc { font-size: 12px; color: var(--color-text-secondary); }
.tr-photo-note { font-size: 12px; color: var(--color-text-tertiary); }
`.trim();

const HTML = `
<section class="tr" aria-labelledby="tr-title">
  <div class="tr-head">
    <div>
      <h2 id="tr-title">Coastal trip: San Francisco to Santa Barbara</h2>
      <p class="tr-sub">Illustrative four-day itinerary down Highway 1 toward Los Angeles. Stop coordinates are approximate.</p>
    </div>
    <div class="tr-chips"><span class="tr-chip">4 days</span><span class="tr-chip">5 stops</span></div>
  </div>
  <p id="tr-status" class="tr-status" role="status">Loading map library…</p>
  <div id="tr-map" class="tr-map" aria-label="Map of the itinerary stops"></div>
  <p class="tr-legend">Illustrative itinerary connections — not verified driving directions. Basemap: USGS The National Map (live tiles, US coverage).</p>
  <div class="tr-actions">
    <button type="button" id="tr-pause" disabled>Pause</button>
    <button type="button" id="tr-replay" disabled>Replay</button>
  </div>
  <ol class="tr-strip" id="tr-strip">
    <li><button type="button" class="tr-card" data-lat="37.7749" data-lng="-122.4194"><span class="tr-num">Stop 1 · approx. 37.77, −122.42</span><span class="tr-name">San Francisco</span><span class="tr-day">Day 1 · start</span><span class="tr-desc">Breakfast by the bay, then south along the coast.</span></button></li>
    <li><button type="button" class="tr-card" data-lat="37.4636" data-lng="-122.4286"><span class="tr-num">Stop 2 · approx. 37.46, −122.43</span><span class="tr-name">Half Moon Bay</span><span class="tr-day">Day 1 · evening</span><span class="tr-desc">Harbour walk and a coastal sunset.</span></button></li>
    <li><button type="button" class="tr-card" data-lat="36.9741" data-lng="-122.0308"><span class="tr-num">Stop 3 · approx. 36.97, −122.03</span><span class="tr-name">Santa Cruz</span><span class="tr-day">Day 2</span><span class="tr-desc">Boardwalk morning and redwood-edge trails.</span></button></li>
    <li><button type="button" class="tr-card" data-lat="36.6002" data-lng="-121.8947"><span class="tr-num">Stop 4 · approx. 36.60, −121.89</span><span class="tr-name">Monterey</span><span class="tr-day">Day 3</span><span class="tr-desc">Aquarium and a slow Cannery Row stroll.</span></button></li>
    <li><button type="button" class="tr-card" data-lat="34.4208" data-lng="-119.6982"><span class="tr-num">Stop 5 · approx. 34.42, −119.70</span><span class="tr-name">Santa Barbara</span><span class="tr-day">Day 4</span><span class="tr-desc">Mission views and the pier before the last leg to Los Angeles.</span></button></li>
  </ol>
  <p class="tr-photo-note">Photo cards are omitted here: stop photos come from the get_trip_stop_images tool, which this static sample does not call.</p>
</section>
`.trim();

const JS_FUNCTIONS = `
async function loadLeaflet() {
  if (window.L) return window.L;
  var cssResponse = await fetch("https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css");
  if (!cssResponse.ok) throw new Error("Leaflet stylesheet failed with status " + cssResponse.status);
  var style = document.createElement("style");
  style.textContent = await cssResponse.text();
  document.head.appendChild(style);
  await new Promise(function (resolve, reject) {
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
    script.onload = resolve;
    script.onerror = function () { reject(new Error("Leaflet script could not be loaded")); };
    document.head.appendChild(script);
  });
  return window.L;
}

function connectTour(points, routeLine, pinElements, activateStop, reportState) {
  return window.createTripAnimator({
    stopCount: points.length,
    durationMs: 6000,
    pinElements: pinElements,
    onFrame: function (frame) {
      var count = frame.pinIndex + (frame.pinProgress >= 0.7 ? 1 : 0);
      routeLine.setLatLngs(points.slice(0, count));
      activateStop(frame.activeStop);
    },
    onState: reportState
  });
}

function showTripError(error) {
  var status = document.getElementById("tr-status");
  var reason = error && error.message ? error.message : "unknown error";
  status.textContent = "The map could not load (" + reason + "). The stop list below still describes the itinerary.";
  status.classList.add("is-error");
}

async function setupTrip() {
  var status = document.getElementById("tr-status");
  var strip = document.getElementById("tr-strip");
  var cards = Array.from(strip.querySelectorAll(".tr-card"));
  var points = cards.map(function (card) { return [Number(card.dataset.lat), Number(card.dataset.lng)]; });
  var pauseButton = document.getElementById("tr-pause");
  var replayButton = document.getElementById("tr-replay");
  if (typeof window.createTripAnimator !== "function") throw new Error("trip animator helper is not installed");
  var L = await loadLeaflet();
  status.textContent = "Waiting for the first basemap tile…";
  var map = L.map("tr-map", { scrollWheelZoom: false });
  var tiles = L.tileLayer("https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}", {
    maxNativeZoom: 16,
    maxZoom: 18,
    attribution: '<a href="https://www.usgs.gov/programs/national-geospatial-program/national-map">USGS The National Map</a>'
  }).addTo(map);
  var accent = getComputedStyle(document.documentElement).getPropertyValue("--color-text-info").trim();
  var routeLine = L.polyline([], { color: accent, weight: 2, dashArray: "6 6" }).addTo(map);
  var pinElements = points.map(function (latlng, index) {
    var icon = L.divIcon({ className: "tr-pin", html: '<span class="pin-dot">' + (index + 1) + '</span>', iconSize: [28, 28], iconAnchor: [14, 14] });
    var marker = L.marker(latlng, { icon: icon, keyboard: false }).addTo(map);
    marker.on("click", function () { jumpTo(index); });
    return marker.getElement().querySelector(".pin-dot");
  });
  map.fitBounds(L.latLngBounds(points), { padding: [28, 28] });
  map.invalidateSize();
  var activeIndex = -1;
  var state = "paused";
  var controller = null;
  var started = false;
  function activateStop(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    cards.forEach(function (card, i) {
      if (i === index) card.setAttribute("aria-current", "step"); else card.removeAttribute("aria-current");
      pinElements[i].classList.toggle("is-active", i === index);
    });
    var card = cards[index];
    var maxScroll = Math.max(0, strip.scrollWidth - strip.clientWidth);
    strip.scrollLeft = Math.max(0, Math.min(maxScroll, card.offsetLeft - strip.offsetLeft));
    if (started) status.textContent = "Stop " + (index + 1) + " of " + points.length + ": " + card.querySelector(".tr-name").textContent + " (" + card.querySelector(".tr-day").textContent + ").";
  }
  function reportState(next) {
    state = next;
    pauseButton.textContent = next === "playing" ? "Pause" : "Resume";
    pauseButton.disabled = next === "complete";
    replayButton.disabled = false;
  }
  function jumpTo(index) {
    if (!controller) return;
    controller.seek(index);
    map.panTo(points[index], { animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches });
  }
  cards.forEach(function (card, index) {
    card.addEventListener("click", function () { jumpTo(index); });
  });
  controller = connectTour(points, routeLine, pinElements, activateStop, reportState);
  pauseButton.addEventListener("click", function () {
    if (state === "playing") controller.pause(); else controller.play();
  });
  replayButton.addEventListener("click", function () { controller.replay(); });
  tiles.once("tileload", function () {
    started = true;
    status.classList.remove("is-error");
    status.textContent = "Basemap loaded. Pinning the stops one by one…";
    controller.play();
  });
  tiles.on("tileerror", function () {
    if (started) return;
    status.textContent = "Basemap tiles are not loading right now (the USGS service is best-effort). The stop list below still describes the itinerary.";
    status.classList.add("is-error");
  });
}
`.trim();

export const COASTAL_TRIP_SAMPLE: GallerySample = {
  id: "reconstructed-coastal-trip",
  title: "Coastal trip pin drops",
  description:
    RECONSTRUCTED_LABEL +
    "。示範 advanced-visualization 技能的行程地圖寫法：以 script 元素載入 Leaflet 1.9.4、fetch 樣式文字塞進 style 元素、USGS 地形圖磚與可見出處、編號 divIcon 內層 .pin-dot 交給 window.createTripAnimator 逐一落釘並揭露連線、文字卡片列、Pause／Resume／Replay、第一張圖磚載入後才開始，圖磚或函式庫失敗都有可讀狀態。",
  provenance: "reconstructed",
  visualization: "animated_route",
  prompt: PROMPT,
  initialHeight: 620,
  placeholderMessages: ["Listing the five stops…", "Loading the map library…", "Placing the numbered pins…"],
  css: CSS,
  html: HTML,
  jsFunctions: JS_FUNCTIONS,
  jsExpressions: ["setupTrip().catch(showTripError);"],
  needsNetwork: ["jsdelivr", "usgs"],
};
