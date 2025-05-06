// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.");

  const landingPage = document.getElementById("landing-page");
  const passcode_input = document.getElementById("passcode-input");
  const enterButton = document.getElementById("enter-button");
  const errorMessage = document.getElementById("error-message");
  const loader = document.getElementById("loader");
  const arContainer = document.getElementById("ar-container");
  const viewfinder = document.getElementById("viewfinder");
  let arSceneEl = null;

  const validAnimals = ["bird", "dino"];
  console.log("Valid animals:", validAnimals);

  // --- A-Frame Component for Handling Marker Events ---
  AFRAME.registerComponent("markerhandler", {
    init: function () {
      console.log(`[MARKERHANDLER] Initialized for marker: ${this.el.id}`);
      this.modelEntity = this.el.querySelector("a-entity[gltf-model]"); // Find the child model

      if (!this.modelEntity) {
        console.error(
          `[MARKERHANDLER] No model entity found as child of ${this.el.id}`
        );
        return;
      }

      this.el.addEventListener("markerFound", () => {
        console.log(
          `%c[MARKERHANDLER_EVENT] MARKER FOUND: ${this.el.id}`,
          "color: blue; font-weight: bold;"
        );
        if (this.modelEntity) {
          this.modelEntity.setAttribute("visible", "true");
          console.log(
            `[MARKERHANDLER_EVENT] Model ${this.modelEntity.id} set to visible.`
          );
        }
      });

      this.el.addEventListener("markerLost", () => {
        console.log(
          `%c[MARKERHANDLER_EVENT] MARKER LOST: ${this.el.id}`,
          "color: orange;"
        );
        if (this.modelEntity) {
          this.modelEntity.setAttribute("visible", "false");
          console.log(
            `[MARKERHANDLER_EVENT] Model ${this.modelEntity.id} set to invisible.`
          );
        }
      });

      // Check if AR.js marker component is actually on this.el
      // This check runs when 'markerhandler' inits, which is part of A-Frame's entity lifecycle
      setTimeout(() => {
        // Slight delay to give AR.js marker component time to attach
        if (
          this.el.components &&
          this.el.components.marker &&
          this.el.components.marker.data
        ) {
          console.log(
            `%c[MARKERHANDLER_CHECK] SUCCESS: AR.js 'marker' component IS PRESENT on ${this.el.id}. Data:`,
            "color: green; font-weight: bold;",
            JSON.stringify(this.el.components.marker.data)
          );
        } else {
          let componentStatus = "NOT present";
          if (this.el.components) {
            componentStatus =
              "'marker' key missing in components object or no data";
          } else {
            componentStatus = "this.el.components object itself is missing";
          }
          console.warn(
            `%c[MARKERHANDLER_CHECK] FAIL: AR.js 'marker' component ${componentStatus} on ${this.el.id} (after delay).`,
            "color: red; font-weight: bold;"
          );
        }
      }, 1000); // 1 second delay for this check
    },
  });

  // --- Model Event Listeners (can still be global or attached differently if needed) ---
  function setupGlobalModelListeners() {
    console.log(
      "[MODEL_LISTENERS_SETUP] Setting up global listeners for model events."
    );
    const modelsToWatch = ["model-bird", "model-dino"];
    modelsToWatch.forEach((modelId) => {
      const modelEl = document.getElementById(modelId);
      if (modelEl) {
        modelEl.removeEventListener("model-loaded", handleModelLoaded); // Prevent duplicates
        modelEl.removeEventListener("model-error", handleModelError);

        modelEl.addEventListener("model-loaded", handleModelLoaded);
        modelEl.addEventListener("model-error", handleModelError);
        console.log(`[MODEL_LISTENERS_SETUP] Listeners attached to ${modelId}`);
      } else {
        console.warn(
          `[MODEL_LISTENERS_SETUP] Model element ${modelId} not found for global listeners.`
        );
      }
    });
  }

  function handleModelLoaded(event) {
    const modelEl = event.target;
    console.log(
      `%c[MODEL_EVENT] SUCCESS: ${modelEl.id} 3D model loaded.`,
      "color: green; font-weight: bold;"
    );
    // Model is initially invisible, made visible by markerhandler
  }

  function handleModelError(event) {
    const modelEl = event.target;
    console.error(
      `%c[MODEL_EVENT] ERROR: ${modelEl.id} 3D model failed to load.`,
      "color: red; font-weight: bold;",
      "Src:",
      event.detail.src
    );
  }

  // --- Passcode Flow ---
  enterButton.addEventListener("click", () => {
    console.log("[PASSCODE_FLOW] Enter AR button clicked.");
    const enteredPasscode = passcode_input.value.trim().toLowerCase();

    if (validAnimals.includes(enteredPasscode)) {
      console.log("[PASSCODE_FLOW] Access Granted for:", enteredPasscode);
      landingPage.classList.add("hidden");
      loader.style.display = "flex";
      loader.classList.remove("hidden");
      if (viewfinder) viewfinder.style.display = "none";

      setTimeout(() => {
        // Give a moment for CSS transitions
        arContainer.style.display = "block";
        console.log("[PASSCODE_FLOW] AR container display set to block.");

        arSceneEl = document.getElementById("ar-scene");
        if (!arSceneEl) {
          console.error(
            "[PASSCODE_FLOW_ERROR] AR Scene element (ar-scene) not found!"
          );
          loader.classList.add("hidden");
          setTimeout(() => (loader.style.display = "none"), 500);
          return;
        }

        console.log(
          "[PASSCODE_FLOW] Waiting for A-Frame scene to be ready and AR.js to initialize..."
        );

        // Check if main AR.js system component is on the scene
        // This check should happen after scene is in DOM and A-Frame starts processing
        function checkARSystemReady() {
          if (arSceneEl.components && arSceneEl.components.arjs) {
            console.log(
              "%c[AR_SYSTEM_CHECK] SUCCESS: AR.js system component IS PRESENT on a-scene.",
              "color: green; font-weight: bold;"
            );
            // Setup global model listeners once AR system seems to be on scene
            setupGlobalModelListeners();
            if (viewfinder) viewfinder.style.display = "flex"; // Show viewfinder
            loader.classList.add("hidden");
            setTimeout(() => (loader.style.display = "none"), 500);
          } else {
            console.warn(
              "%c[AR_SYSTEM_CHECK] PENDING: AR.js system component NOT YET present on a-scene. Retrying...",
              "color: orange;"
            );
            setTimeout(checkARSystemReady, 1000); // Retry after 1 second
          }
        }

        if (arSceneEl.hasLoaded) {
          console.log(
            "[PASSCODE_FLOW_INFO] A-Frame scene.hasLoaded is already true. Starting AR system check."
          );
          checkARSystemReady();
        } else {
          arSceneEl.addEventListener(
            "loaded",
            () => {
              console.log(
                '%c[SCENE_EVENT] A-Frame scene "loaded" event fired. Starting AR system check.',
                "color: blue; font-weight: bold;"
              );
              checkARSystemReady();
            },
            { once: true }
          );
        }

        // Fallback loader hide, in case checks take too long or fail
        setTimeout(() => {
          if (!loader.classList.contains("hidden")) {
            console.log("[LOADER_TIMEOUT_FALLBACK] Hiding loader.");
            loader.classList.add("hidden");
            setTimeout(() => (loader.style.display = "none"), 500);
            if (
              viewfinder &&
              viewfinder.style.display === "none" &&
              arContainer.style.display === "block"
            ) {
              // If loader was hidden by fallback but AR container is visible, show viewfinder
              console.log("[LOADER_TIMEOUT_FALLBACK] Showing viewfinder.");
              viewfinder.style.display = "flex";
            }
          }
        }, 10000); // 10 second overall timeout for loader
      }, 500);
    } else {
      errorMessage.textContent = 'Invalid animal name. Try "bird" or "dino".';
      // ... (shake animation for input)
      passcode_input.style.animation = "shake 0.5s ease";
      setTimeout(() => (passcode_input.style.animation = ""), 500);
    }
  });

  // ... (passcode_input keypress and shake animation CSS) ...
  passcode_input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") enterButton.click();
  });

  if (document.styleSheets.length > 0 && document.styleSheets[0].cssRules) {
    if (
      ![...document.styleSheets[0].cssRules].some(
        (rule) => "name" in rule && rule.name === "shake"
      )
    ) {
      try {
        document.styleSheets[0].insertRule(
          `@keyframes shake {0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); }}`,
          document.styleSheets[0].cssRules.length
        );
        console.log("Shake animation CSS rule inserted.");
      } catch (e) {
        console.warn("Could not insert shake animation rule:", e);
      }
    }
  } else {
    console.warn("Stylesheet not available for shake animation.");
  }

  console.log("Initial script setup complete.");
});
