import App from "./app/App";

export default async function initScene() {
  // Initialize the app
  const app = new App();

  return () => {
    // Cleanup
    if (app) app.dispose();
  };
}
