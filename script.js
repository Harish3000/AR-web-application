// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.");

  const landingPage = document.getElementById("landing-page");
  const passcode_input = document.getElementById("passcode-input");
  const enterButton = document.getElementById("enter-button");
  const errorMessage = document.getElementById("error-message");
  const loader = document.getElementById("loader");
  const arContainer = document.getElementById("ar-container");
  const viewfinder = document.getElementById("viewfinder"); // Get viewfinder element
  let arSceneEl = null;

  const validAnimals = ["bird", "dino"];
  console.log("Valid animals:", validAnimals);

  function checkMarkerComponent(markerId) {
    const markerEl = document.getElementById(markerId);
    if (markerEl) {
      if (markerEl.components.marker && markerEl.components.marker.data) {
        console.log(
          `%c[MARKER_CHECK] SUCCESS: AR.js 'marker' component IS PRESENT on ${markerId}. Data:`,
          "color: green; font-weight: bold;",
          JSON.stringify(markerEl.components.marker.data)
        );
        return true;
      } else {
        console.warn(
          `%c[MARKER_CHECK] PENDING: AR.js 'marker' component NOT YET present on ${markerId}. Will re-check.`,
          "color: orange; font-weight: bold;"
        );
      }
    } else {
      console.error(
        `[MARKER_CHECK] ERROR: Marker element ${markerId} not found in DOM.`
      );
    }
    return false;
  }

  // Function to be called repeatedly to check if AR.js marker components are ready
  function pollForMarkerComponents(callback, maxAttempts = 10, interval = 500) {
    let attempts = 0;
    function check() {
      attempts++;
      let allReady = true;
      for (const markerId of ["marker-bird", "marker-dino"]) {
        if (!checkMarkerComponent(markerId)) {
          allReady = false;
          break;
        }
      }

      if (allReady) {
        console.log(
          "%c[POLL_MARKERS] All AR.js marker components are now PRESENT.",
          "color: green; font-weight: bold;"
        );
        callback();
      } else if (attempts < maxAttempts) {
        console.log(
          `[POLL_MARKERS] Attempt ${attempts}/${maxAttempts}: Not all marker components ready. Retrying in ${interval}ms...`
        );
        setTimeout(check, interval);
      } else {
        console.error(
          `%c[POLL_MARKERS] FAILED: AR.js marker components did not become present after ${maxAttempts} attempts. Marker detection will likely fail.`,
          "color: red; font-weight: bold;"
        );
        // Proceed to attach listeners anyway, but with low expectation
        callback();
      }
    }
    check(); // Start polling
  }

  function setupModelAndMarkerListeners() {
    console.log(
      "[LISTENERS_SETUP] Attaching model and AR.js marker event listeners."
    );

    const markers = {
      "marker-bird": document.getElementById("marker-bird"),
      "marker-dino": document.getElementById("marker-dino"),
    };
    const models = {
      "model-bird": document.getElementById("model-bird"),
      "model-dino": document.getElementById("model-dino"),
    };

    for (const markerId in markers) {
      const markerEl = markers[markerId];
      if (markerEl) {
        markerEl.removeEventListener("markerFound", handleMarkerFound);
        markerEl.removeEventListener("markerLost", handleMarkerLost);
        markerEl.addEventListener("markerFound", handleMarkerFound);
        markerEl.addEventListener("markerLost", handleMarkerLost);
        console.log(
          `[LISTENERS_SETUP] Event listeners for marker ${markerEl.id} attached.`
        );
      } else {
        console.error(
          `[LISTENERS_SETUP] Marker element ${markerId} not found during listener setup.`
        );
      }
    }

    for (const modelId in models) {
      const modelEl = models[modelId];
      if (modelEl) {
        modelEl.removeEventListener("model-loaded", handleModelLoaded);
        modelEl.removeEventListener("model-error", handleModelError);
        modelEl.addEventListener("model-loaded", handleModelLoaded);
        modelEl.addEventListener("model-error", handleModelError);
        console.log(
          `[LISTENERS_SETUP] Event listeners for model ${modelId} attached.`
        );
      } else {
        console.error(
          `[LISTENERS_SETUP] Model element ${modelId} not found during listener setup.`
        );
      }
    }
    console.log(
      "[LISTENERS_SETUP] Finished attaching model and AR.js marker event listeners."
    );
  }

  // Event Handlers
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
    /* ... (same as before) ... */
  }
  function handleModelLoaded(event) {
    /* ... (same as before) ... */
  }
  function handleModelError(event) {
    /* ... (same as before) ... */
  }
  // (Copy these handlers from the previous script version if you had them fully written out)
  function handleMarkerLost(event) {
    const markerEl = event.target;
    console.log(`%c[AR_EVENT] MARKER LOST: ${markerEl.id}`, "color: orange;");
    // Optionally hide model:
    // const modelEl = document.getElementById(markerEl.id.replace('marker-', 'model-'));
    // if (modelEl) modelEl.setAttribute('visible', 'false');
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
      if (viewfinder) viewfinder.style.display = "none"; // Hide viewfinder during loading

      setTimeout(() => {
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
          '[PASSCODE_FLOW] Waiting for A-Frame scene "loaded" and AR.js setup...'
        );
        if (arSceneEl.components.arjs) {
          console.log(
            "[PASSCODE_FLOW_INFO] AR.js component IS present on a-scene."
          );
        } else {
          console.warn(
            "[PASSCODE_FLOW_WARN] AR.js component NOT present on a-scene initially. This might indicate a problem."
          );
        }

        let sceneLoaded = false;
        let arSystemReady = false; // General flag for AR readiness
        let mainLogicInitialized = false;

        function tryInitMainLogic() {
          if (mainLogicInitialized) return;
          if (sceneLoaded && arSystemReady) {
            mainLogicInitialized = true;
            console.log(
              "%c[SYSTEM_READY] A-Frame scene loaded and AR system presumed ready. Starting polling for marker components.",
              "background: #222; color: #bada55; font-weight: bold"
            );
            // Now we poll until marker components are actually there before fully setting up listeners
            pollForMarkerComponents(setupModelAndMarkerListeners);
            if (viewfinder) viewfinder.style.display = "flex"; // Show viewfinder
            loader.classList.add("hidden"); // Hide loader once we start polling
            setTimeout(() => (loader.style.display = "none"), 500);
          }
        }

        if (arSceneEl.hasLoaded) {
          console.log(
            "[PASSCODE_FLOW_INFO] A-Frame scene.hasLoaded is already true."
          );
          sceneLoaded = true;
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

        // Use a general timeout for AR.js to be ready instead of specific 'arjs-video-loaded'
        // as that event was proving unreliable.
        const arReadyTimeout = 5000; // 5 seconds for AR.js to initialize
        console.log(
          `[PASSCODE_FLOW] Setting a ${
            arReadyTimeout / 1000
          }s timeout to assume AR system is ready if no specific event confirms earlier.`
        );
        setTimeout(() => {
          if (!arSystemReady) {
            // If no other event has set it
            console.log(
              `%c[AR_READY_TIMEOUT] Assuming AR system is ready after ${
                arReadyTimeout / 1000
              }s.`,
              "color: purple; font-weight: bold;"
            );
            arSystemReady = true;
            tryInitMainLogic();
          }
        }, arReadyTimeout);

        // If arjs-video-loaded *does* fire with this AR.js version, it's a bonus
        arSceneEl.addEventListener(
          "arjs-video-loaded",
          () => {
            console.log(
              '%c[ARJS_EVENT] AR.js "arjs-video-loaded" event fired (BONUS).',
              "color: magenta; font-weight: bold;"
            );
            if (!arSystemReady) {
              // If timeout hasn't already set it
              arSystemReady = true;
              tryInitMainLogic();
            }
          },
          { once: true }
        );
      }, 500);
    } else {
      /* ... (error handling for passcode) ... */
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
