import { DEMO_EXAMPLES } from "@/components/demo-gallery/demo-data";
import { RECONSTRUCTED_LABEL, type GallerySample } from "./types";

const PROMPT = DEMO_EXAMPLES.find((item) => item.id === "demo-pitch-roll-yaw")?.prompt ?? "";

const CSS = `
.ap { font-family: var(--font-sans); color: var(--color-text-primary); display: grid; gap: 12px; max-width: 640px; }
.ap h2 { font-size: 18px; font-weight: 500; line-height: 1.3; }
.ap-axes { list-style: none; padding: 0; display: grid; gap: 4px; font-size: 13px; line-height: 1.5; color: var(--color-text-secondary); }
.ap-term { color: var(--color-text-primary); font-weight: 500; }
.ap-swatch { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 6px; vertical-align: middle; }
.ap-pitch { background: var(--color-text-danger); }
.ap-roll { background: var(--color-text-success); }
.ap-yaw { background: var(--color-text-info); }
.ap-status { font-size: 13px; color: var(--color-text-secondary); }
.ap-canvas { height: 260px; border-radius: var(--border-radius-lg); overflow: hidden; background: var(--color-background-secondary); border: 0.5px solid var(--color-border-tertiary); touch-action: none; cursor: grab; }
.ap-canvas canvas { display: block; width: 100%; height: 100%; }
.ap-controls { display: grid; gap: 10px; }
.ap-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 10px; align-items: center; }
.ap-row label { grid-column: 1 / -1; font-size: 13px; color: var(--color-text-secondary); }
.ap-row input { width: 100%; }
.ap-out { color: var(--color-text-primary); font-weight: 500; font-family: var(--font-mono); }
.ap-note { font-size: 12px; color: var(--color-text-tertiary); line-height: 1.5; }
`.trim();

const HTML = `
<section class="ap" aria-labelledby="ap-title">
  <h2 id="ap-title">Pitch, roll and yaw</h2>
  <ul class="ap-axes">
    <li><span class="ap-swatch ap-pitch" aria-hidden="true"></span><span class="ap-term">Pitch</span> — the nose rises or drops. Rotation about the lateral axis, the red line running wingtip to wingtip.</li>
    <li><span class="ap-swatch ap-roll" aria-hidden="true"></span><span class="ap-term">Roll</span> — the wings bank. Rotation about the longitudinal axis, the green line running nose to tail.</li>
    <li><span class="ap-swatch ap-yaw" aria-hidden="true"></span><span class="ap-term">Yaw</span> — the nose turns left or right. Rotation about the vertical axis, the blue line through the plane top to bottom.</li>
  </ul>
  <p id="status" class="ap-status" role="status">Loading 3D scene…</p>
  <div id="ap-canvas" class="ap-canvas" aria-label="3D airplane. Drag with the pointer to orbit the camera."></div>
  <div class="ap-controls">
    <div class="ap-row">
      <label for="ap-pitch">Pitch: <span class="ap-out" id="ap-pitch-out">0°</span> (−45 to 45°)</label>
      <input id="ap-pitch" type="range" min="-45" max="45" step="1" value="0" data-axis="pitch">
      <button type="button" data-demo="pitch">Demonstrate pitch</button>
    </div>
    <div class="ap-row">
      <label for="ap-roll">Roll: <span class="ap-out" id="ap-roll-out">0°</span> (−45 to 45°)</label>
      <input id="ap-roll" type="range" min="-45" max="45" step="1" value="0" data-axis="roll">
      <button type="button" data-demo="roll">Demonstrate roll</button>
    </div>
    <div class="ap-row">
      <label for="ap-yaw">Yaw: <span class="ap-out" id="ap-yaw-out">0°</span> (−45 to 45°)</label>
      <input id="ap-yaw" type="range" min="-45" max="45" step="1" value="0" data-axis="yaw">
      <button type="button" data-demo="yaw">Demonstrate yaw</button>
    </div>
    <div><button type="button" id="ap-reset">Reset</button></div>
  </div>
  <p class="ap-note">Conceptual rotation model, not a flight simulator. Positive pitch = nose up, positive roll = right wing down, positive yaw = nose right. Axes are body axes, so they turn with the plane.</p>
</section>
`.trim();

const JS_FUNCTIONS = `
function planeToken(name, fallback) {
  var value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function buildPlane(THREE, colors) {
  var group = new THREE.Group();
  function part(geometry, color, x, y, z) {
    var mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 }));
    mesh.position.set(x, y, z);
    group.add(mesh);
    return mesh;
  }
  part(new THREE.CylinderGeometry(0.18, 0.28, 3.2, 24), colors.body, 0, 0, 0).rotation.z = Math.PI / 2;
  part(new THREE.SphereGeometry(0.28, 24, 16), colors.body, 1.6, 0, 0);
  part(new THREE.SphereGeometry(0.2, 20, 12), colors.cockpit, 0.8, 0.22, 0).scale.set(1.8, 0.7, 1);
  part(new THREE.BoxGeometry(0.7, 0.06, 3.8), colors.wing, 0.1, 0, 0);
  part(new THREE.BoxGeometry(0.4, 0.05, 1.4), colors.wing, -1.45, 0, 0);
  part(new THREE.BoxGeometry(0.45, 0.8, 0.05), colors.wing, -1.45, 0.4, 0);
  return group;
}

function axisLine(THREE, x, y, z, color) {
  var points = [new THREE.Vector3(-x, -y, -z), new THREE.Vector3(x, y, z)];
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: color }));
}

async function setupScene() {
  var status = document.getElementById("status");
  var host = document.getElementById("ap-canvas");
  var THREE = await import("three");
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } catch (error) {
    throw new Error("WebGL could not initialize in this browser");
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  host.appendChild(renderer.domElement);
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(planeToken("--color-background-secondary", "whitesmoke"));
  scene.add(new THREE.HemisphereLight("white", "gray", 1.1));
  var sun = new THREE.DirectionalLight("white", 1.4);
  sun.position.set(4, 6, 3);
  scene.add(sun);
  var colors = {
    body: planeToken("--color-text-tertiary", "silver"),
    wing: planeToken("--color-text-secondary", "gray"),
    cockpit: planeToken("--color-text-info", "steelblue"),
    pitch: planeToken("--color-text-danger", "crimson"),
    roll: planeToken("--color-text-success", "seagreen"),
    yaw: planeToken("--color-text-info", "steelblue")
  };
  var plane = buildPlane(THREE, colors);
  plane.rotation.order = "YZX";
  plane.add(axisLine(THREE, 0, 0, 2.6, colors.pitch));
  plane.add(axisLine(THREE, 2.6, 0, 0, colors.roll));
  plane.add(axisLine(THREE, 0, 2, 0, colors.yaw));
  scene.add(plane);
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  var orbit = { theta: 0.7, phi: 1.05, radius: 7.5 };
  function placeCamera() {
    camera.position.set(
      orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta),
      orbit.radius * Math.cos(orbit.phi),
      orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta));
    camera.lookAt(0, 0, 0);
  }
  var axes = ["pitch", "roll", "yaw"];
  var angles = { pitch: 0, roll: 0, yaw: 0 };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tween = null;
  var frameId = 0;
  function applyAngles() {
    var rad = THREE.MathUtils.degToRad;
    plane.rotation.set(-rad(angles.roll), rad(angles.yaw), rad(angles.pitch));
    axes.forEach(function (axis) {
      document.getElementById("ap-" + axis).value = String(Math.round(angles[axis]));
      document.getElementById("ap-" + axis + "-out").textContent = Math.round(angles[axis]) + "°";
    });
  }
  function demonstrate(axis) {
    if (reduced) {
      angles[axis] = 30;
      applyAngles();
      status.textContent = "Reduced motion: showing " + axis + " at 30° without animation. Use the slider or Reset to change it.";
      return;
    }
    tween = { axis: axis, from: angles[axis], start: performance.now(), duration: 1500 };
    status.textContent = "Demonstrating " + axis + "…";
  }
  function resetAll() {
    orbit.theta = 0.7;
    orbit.phi = 1.05;
    placeCamera();
    if (reduced) {
      angles = { pitch: 0, roll: 0, yaw: 0 };
      applyAngles();
    } else {
      tween = { axis: "all", from: { pitch: angles.pitch, roll: angles.roll, yaw: angles.yaw }, start: performance.now(), duration: 1500 };
    }
    status.textContent = "Reset to level flight and the three-quarter view.";
  }
  function step(now) {
    if (tween) {
      var t = Math.min(1, (now - tween.start) / tween.duration);
      var eased = easeInOut(t);
      if (tween.axis === "all") {
        axes.forEach(function (axis) { angles[axis] = tween.from[axis] * (1 - eased); });
      } else {
        angles[tween.axis] = tween.from + 35 * Math.sin(2 * Math.PI * eased);
      }
      applyAngles();
      if (t >= 1) {
        tween = null;
        status.textContent = "Drag to orbit the camera; use the sliders or Demonstrate buttons.";
      }
    }
    renderer.render(scene, camera);
    frameId = requestAnimationFrame(step);
  }
  function resize() {
    var width = host.clientWidth || 320;
    var height = host.clientHeight || 260;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  var drag = null;
  var canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", function (event) {
    drag = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", function (event) {
    if (!drag) return;
    orbit.theta -= (event.clientX - drag.x) * 0.01;
    orbit.phi = Math.min(2.6, Math.max(0.4, orbit.phi - (event.clientY - drag.y) * 0.01));
    drag = { x: event.clientX, y: event.clientY };
    placeCamera();
  });
  canvas.addEventListener("pointerup", function () { drag = null; });
  canvas.addEventListener("pointercancel", function () { drag = null; });
  axes.forEach(function (axis) {
    document.getElementById("ap-" + axis).addEventListener("input", function (event) {
      tween = null;
      var value = event.target.valueAsNumber;
      angles[axis] = Number.isFinite(value) ? Math.max(-45, Math.min(45, value)) : 0;
      applyAngles();
    });
  });
  Array.from(document.querySelectorAll("[data-demo]")).forEach(function (button) {
    button.addEventListener("click", function () { demonstrate(button.dataset.demo); });
  });
  document.getElementById("ap-reset").addEventListener("click", resetAll);
  new ResizeObserver(resize).observe(host);
  window.addEventListener("pagehide", function () {
    cancelAnimationFrame(frameId);
    scene.traverse(function (object) {
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
    });
    renderer.dispose();
  });
  resize();
  placeCamera();
  applyAngles();
  status.textContent = "Drag to orbit the camera; use the sliders or Demonstrate buttons.";
  frameId = requestAnimationFrame(step);
}

function showSceneError(error) {
  var status = document.getElementById("status");
  var reason = error && error.message ? error.message : "unknown error";
  status.textContent = "The 3D scene could not load (" + reason + "). The explanation above still applies.";
  Array.from(document.querySelectorAll(".ap-controls input, .ap-controls button")).forEach(function (control) {
    control.disabled = true;
  });
}
`.trim();

export const AIRPLANE_3D_SAMPLE: GallerySample = {
  id: "reconstructed-airplane-3d",
  title: "Airplane pitch, roll and yaw",
  description:
    RECONSTRUCTED_LABEL +
    "。示範 Three.js 場景：在 async 函式內 import 'three'、以設計代幣解析材質顏色、用盒體與圓柱拼出可辨認的飛機與三條機體軸線、手寫指標拖曳環繞相機、單一動畫迴圈、1.5 秒示範動畫（reduced-motion 直接跳轉）、WebGL 失敗顯示可讀訊息並停用控制項、pagehide 時釋放資源。",
  provenance: "reconstructed",
  visualization: "interactive_diagram",
  prompt: PROMPT,
  initialHeight: 560,
  placeholderMessages: ["Explaining the three axes…", "Loading Three.js…", "Assembling the airplane…"],
  css: CSS,
  html: HTML,
  jsFunctions: JS_FUNCTIONS,
  jsExpressions: ["setupScene().catch(showSceneError);"],
  needsNetwork: ["esm.sh"],
};
