import assetStore from "../utils/AssetStore";

const fade = ["fade-out", "fade-in"];

export default class Preloader {
  overlay: HTMLDivElement;
  loader: HTMLDivElement;
  progressBar: HTMLDivElement;
  progressText: HTMLDivElement;
  startButton: HTMLButtonElement;

  constructor() {
    // access to DOM elements
    this.overlay = document.querySelector("#overlay")!;
    this.overlay.style.display = "flex";
    this.loader = document.querySelector("#loader")!;
    this.progressBar = document.querySelector("#progress-bar")!;
    this.progressText = document.querySelector("#progress-percentage")!;
    this.startButton = document.querySelector("button.start")!;

    assetStore.subscribe((state) => {
      const numOfLoadedAssets = Object.keys(state.loadedAssets).length;
      const numOfAssetsToLoad = state.assetsToLoad.length;
      const progress = (numOfLoadedAssets / numOfAssetsToLoad) * 100;
      const percentage = Math.round(progress);

      this.progressBar.style.width = `${percentage}%`;
      this.progressText.textContent = percentage.toString();

      if (progress === 100) {
        setTimeout(() => this.ready(), 1200);
      }
    });
  }

  ready() {
    this.loader.classList.add("fade-out");
    this.startButton.classList.remove("fade-out");
    this.startButton.classList.add("fade-in");
    this.startButton.addEventListener(
      "click",
      () => {
        this.startButton.classList.remove(...fade);
        this.startButton.classList.add("fade-out");
        setTimeout(() => {
          this.overlay.style.display = "none";
        }, 1000);
      },
      { once: true }
    );
  }

  dispose() {
    this.progressText.textContent = "0";
    this.overlay.classList.remove(...fade);
    this.loader.classList.remove(...fade);
    this.startButton.classList.remove(...fade);
    this.startButton.classList.add("fade-out");
  }
}