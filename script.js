// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.");

  const landingPage = document.getElementById("landing-page");
  const passcode_input = document.getElementById("passcode-input");
  const enterButton = document.getElementById("enter-button");
  const errorMessage = document.getElementById("error-message");
  const loader = document.getElementById("loader");
  const arContainer = document.getElementById("ar-container");
  let arSceneEl = null;

  const validAnimals = ["bird", "dino"];
  console.log("Valid animals:", validAnimals);

  function checkMarkerComponent(markerId) {
    const markerEl = document.getElementById(markerId);
    if (markerEl) {
      // Give components a moment to initialize, especially if called early
      // This is a bit of a hack, ideally AR.js events would be perfectly timed
      if (markerEl.components.marker && markerEl.components.marker.data) {
        console.log(
          `%c[MARKER_CHECK] SUCCESS: AR.js 'marker' component IS PRESENT on ${markerId}. Data:`,
          "color: green; font-weight: bold;",
          JSON.stringify(markerEl.components.marker.data)
        );
        return true;
      } else {
        console.warn(
          `%c[MARKER_CHECK] FAIL: AR.js 'marker' component NOT present on ${markerId} (or no data). Checking again in 500ms.`,
          "color: orange; font-weight: bold;"
        );
        // Try one more check after a small delay
        setTimeout(() => {
          if (markerEl.components.marker && markerEl.components.marker.data) {
            console.log(
              `%c[MARKER_CHECK_DELAYED] SUCCESS: AR.js 'marker' component IS PRESENT on ${markerId} after delay. Data:`,
              "color: green; font-weight: bold;",
              JSON.stringify(markerEl.components.marker.data)
            );
          } else {
            console.warn(
              `%c[MARKER_CHECK_DELAYED] FAIL: AR.js 'marker' component STILL NOT present on ${markerId} after delay.`,
              "color: red; font-weight: bold;"
            );
          }
        }, 500);
      }
    } else {
      console.error(
        `[MARKER_CHECK] ERROR: Marker element ${markerId} not found in DOM.`
      );
    }
    return false; // Initial check might be false, relies on delayed for final confirmation
  }

  function setupModelAndMarkerListeners() {
    console.log(
      "[LISTENERS_SETUP] Attempting to setup model and AR.js marker event listeners."
    );

    const markers = {
      "marker-bird": document.getElementById("marker-bird"),
      "marker-dino": document.getElementById("marker-dino"),
    };

    const models = {
      "model-bird": document.getElementById("model-bird"),
      "model-dino": document.getElementById("model-dino"),
    };

    let allMarkersPotentiallyReady = true; // Renamed for clarity
    for (const markerId in markers) {
      // The initial checkMarkerComponent might return false but schedule a delayed check.
      // For now, we proceed to attach listeners regardless, relying on AR.js to eventually fire them if markers become active.
      if (!checkMarkerComponent(markerId)) {
        allMarkersPotentiallyReady = false; // Log if initial check fails
      }
      const markerEl = markers[markerId];
      if (markerEl) {
        // Remove previous listeners to avoid duplicates if this function is called multiple times (defensive)
        markerEl.removeEventListener("markerFound", handleMarkerFound);
        markerEl.removeEventListener("markerLost", handleMarkerLost);

        markerEl.addEventListener("markerFound", handleMarkerFound);
        markerEl.addEventListener("markerLost", handleMarkerLost);
        console.log(
          `[LISTENERS_SETUP] Event listeners for marker ${markerEl.id} attached.`
        );
      } else {
        console.error(
          `[LISTENERS_SETUP] Marker element ${markerId} not found.`
        );
      }
    }

    if (!allMarkersPotentiallyReady) {
      console.warn(
        "[LISTENERS_SETUP] Initial check indicates not all AR.js marker components were immediately active. Detection relies on delayed checks or AR.js internal activation."
      );
    }

    for (const modelId in models) {
      const modelEl = models[modelId];
      if (modelEl) {
        // Remove previous listeners
        modelEl.removeEventListener("model-loaded", handleModelLoaded);
        modelEl.removeEventListener("model-error", handleModelError);

        modelEl.addEventListener("model-loaded", handleModelLoaded);
        modelEl.addEventListener("model-error", handleModelError);
        console.log(
          `[LISTENERS_SETUP] Event listeners for model ${modelId} attached.`
        );
      } else {
        console.error(`[LISTENERS_SETUP] Model element ${modelId} not found.`);
      }
    }
    console.log(
      "[LISTENERS_SETUP] Finished setting up model and AR.js marker event listeners."
    );
  }

  // Event Handlers (defined outside to allow removal)
  function handleMarkerFound(event) {
    const markerEl = event.target;
    console.log(
      `%c[AR_EVENT] MARKER FOUND: ${markerEl.id}`,
      "color: blue; font-weight: bold;"
    );
    const modelEl = document.getElementById(
      markerEl.id.replace("marker-", "model-")
    );
    if (modelEl) {
      const scale = modelEl.getAttribute("scale");
      const position = modelEl.getAttribute("position");
      const rotation = modelEl.getAttribute("rotation");
      console.log(
        `[AR_EVENT_DETAIL] Model for ${markerEl.id}: ${
          modelEl.id
        }, visible: ${modelEl.getAttribute("visible")}`
      );
      console.log(
        `[AR_EVENT_DETAIL]   Scale: x=${scale.x}, y=${scale.y}, z=${scale.z}`
      );
      console.log(
        `[AR_EVENT_DETAIL]   Position: x=${position.x}, y=${position.y}, z=${position.z}`
      );
      console.log(
        `[AR_EVENT_DETAIL]   Rotation: x=${rotation.x}, y=${rotation.y}, z=${rotation.z}`
      );
      modelEl.setAttribute("visible", "true");
    }
  }

  function handleMarkerLost(event) {
    const markerEl = event.target;
    console.log(`%c[AR_EVENT] MARKER LOST: ${markerEl.id}`, "color: orange;");
  }

  function handleModelLoaded(event) {
    const modelEl = event.target;
    console.log(
      `%c[MODEL_EVENT] SUCCESS: ${modelEl.id} 3D model loaded.`,
      "color: green; font-weight: bold;",
      "Detail:",
      event.detail.model
    );
    const scale = modelEl.getAttribute("scale");
    const position = modelEl.getAttribute("position");
    const rotation = modelEl.getAttribute("rotation");
    console.log(`[MODEL_EVENT_DETAIL] ${modelEl.id} Initial Attributes:`);
    console.log(
      `[MODEL_EVENT_DETAIL]   Scale: x=${scale.x}, y=${scale.y}, z=${scale.z}`
    );
    console.log(
      `[MODEL_EVENT_DETAIL]   Position: x=${position.x}, y=${position.y}, z=${position.z}`
    );
    console.log(
      `[MODEL_EVENT_DETAIL]   Rotation: x=${rotation.x}, y=${rotation.y}, z=${rotation.z}`
    );
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

  enterButton.addEventListener("click", () => {
    console.log("[PASSCODE_FLOW] Enter AR button clicked.");
    const enteredPasscode = passcode_input.value.trim().toLowerCase();

    if (validAnimals.includes(enteredPasscode)) {
      console.log("[PASSCODE_FLOW] Access Granted for:", enteredPasscode);
      landingPage.classList.add("hidden");
      loader.style.display = "flex";
      loader.classList.remove("hidden");

      setTimeout(() => {
        arContainer.style.display = "block";
        console.log("[PASSCODE_FLOW] AR container display set to block.");

        arSceneEl = document.getElementById("ar-scene");
        if (!arSceneEl) {
          console.error(
            "[PASSCODE_FLOW_ERROR] AR Scene element (ar-scene) not found!"
          );
          // Hide loader if scene isn't found to prevent indefinite loading
          loader.classList.add("hidden");
          setTimeout(() => (loader.style.display = "none"), 500);
          return;
        }

        console.log(
          '[PASSCODE_FLOW] Waiting for A-Frame scene "loaded" and AR.js "arjs-video-loaded" events...'
        );
        // Log if arjs component is present on scene
        if (arSceneEl.components.arjs) {
          console.log(
            "[PASSCODE_FLOW_INFO] AR.js component IS present on a-scene."
          );
        } else {
          console.warn(
            "[PASSCODE_FLOW_WARN] AR.js component NOT present on a-scene (this is unexpected)."
          );
        }

        let sceneLoaded = false;
        let arVideoLoaded = false;
        let mainLogicInitialized = false; // Flag to ensure one-time init

        function tryInitMainLogic() {
          if (mainLogicInitialized) return; // Already initialized

          if (sceneLoaded && arVideoLoaded) {
            mainLogicInitialized = true;
            console.log(
              "%c[SYSTEM_READY] Both A-Frame scene AND AR.js video are loaded. Initializing main listeners.",
              "background: #222; color: #bada55; font-weight: bold"
            );
            setupModelAndMarkerListeners();
          } else if (sceneLoaded && !arVideoLoaded) {
            console.log(
              "[SYSTEM_WAIT] A-Frame scene loaded, but AR.js video is NOT YET. Waiting for arjs-video-loaded or timeout."
            );
          } else if (!sceneLoaded && arVideoLoaded) {
            console.log(
              "[SYSTEM_WAIT] AR.js video loaded, but A-Frame scene is NOT YET. Waiting for scene loaded or timeout."
            );
          }
        }

        if (arSceneEl.hasLoaded) {
          console.log(
            "[PASSCODE_FLOW_INFO] A-Frame scene.hasLoaded is already true."
          );
          sceneLoaded = true;
          // Don't call tryInitMainLogic immediately, wait for arjs-video-loaded possibility
        } else {
          arSceneEl.addEventListener(
            "loaded",
            () => {
              console.log(
                '%c[SCENE_EVENT] A-Frame scene "loaded" event fired.',
                "color: blue; font-weight: bold;"
              );
              sceneLoaded = true;
              tryInitMainLogic();
            },
            { once: true }
          );
        }

        arSceneEl.addEventListener(
          "arjs-video-loaded",
          () => {
            console.log(
              '%c[ARJS_EVENT] AR.js "arjs-video-loaded" event fired. Video stream should be active.',
              "color: purple; font-weight: bold;"
            );
            arVideoLoaded = true;
            tryInitMainLogic();
          },
          { once: true }
        );

        // Fallback: If arjs-video-loaded doesn't fire after a certain time, but scene has loaded, try initializing anyway.
        // This is a safety net.
        const videoLoadTimeoutDuration = 7000; // 7 seconds
        setTimeout(() => {
          if (!arVideoLoaded && sceneLoaded && !mainLogicInitialized) {
            console.warn(
              `%c[FALLBACK_INIT] AR.js "arjs-video-loaded" event DID NOT fire after ${
                videoLoadTimeoutDuration / 1000
              }s. Attempting to initialize listeners anyway as scene is loaded.`,
              "color: red; font-weight: bold;"
            );
            arVideoLoaded = true; // Assume it should be ready or we force it
            tryInitMainLogic();
          }
          // Hide loader regardless after this timeout
          if (!loader.classList.contains("hidden")) {
            console.log(
              "[LOADER_TIMEOUT] Hiding loader after extended timeout."
            );
            loader.classList.add("hidden");
            setTimeout(() => (loader.style.display = "none"), 500);
          }
        }, videoLoadTimeoutDuration);
      }, 500);
    } else {
      errorMessage.textContent = 'Invalid animal name. Try "bird" or "dino".';
      passcode_input.style.animation = "shake 0.5s ease";
      setTimeout(() => (passcode_input.style.animation = ""), 500);
    }
  });

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
