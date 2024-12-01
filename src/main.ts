import helloWorld from "./scenes/hello-world";
import geometry from "./scenes/geometry";
import materials from "./scenes/materials";
import textures from "./scenes/textures";
import lighting from "./scenes/lighting";
import shadows from "./scenes/shadows";
import solarSystem from "./scenes/solar-system";
import models from "./scenes/models";
import portfolio from "./scenes/portfolio/index";

const scenes: { [key: string]: () => Promise<() => void> } = {
  "hello-world": helloWorld,
  geometry,
  materials,
  textures,
  lighting,
  shadows,
  "Solar System": solarSystem,
  models,
  portfolio,
};

let currentSceneCleanup: (() => void) | null = null;

async function loadScene(scene: string) {
  if (currentSceneCleanup) {
    currentSceneCleanup();
  }

  const initScene = scenes[scene];
  if (initScene) {
    // console.log("Loading scene:", scene, initScene, scenes);
    currentSceneCleanup = await initScene();
  }
  document.title = `Three.js - ${scene}`;
}

document.querySelectorAll("#scene-list a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const scene = (event.target as HTMLElement).getAttribute("data-scene");
    if (scene) {
      loadScene(scene);
    }
  });
});

const sceneListToggle = document.getElementById("scene-list-toggle")!;
const sceneList = document.getElementById("scene-list")!;

// Create li for each scene in 'scene-list-container'
const sceneContainer = document.getElementById("scene-list")!;
for (const scene in scenes) {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.textContent = scene;
  a.setAttribute("data-scene", scene);
  a.addEventListener("click", (event) => {
    event.preventDefault();
    const scene = (event.target as HTMLElement).getAttribute("data-scene");
    if (scene) loadScene(scene);
  });
  li.appendChild(a);
  sceneContainer.appendChild(li);
}

sceneListToggle.addEventListener("click", () => {
  sceneList.classList.toggle("open");
});

// Load default scene
loadScene("portfolio");
