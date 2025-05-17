document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.");

  const landingPage = document.getElementById("landing-page");
  const passcodeInput = document.getElementById("passcode-input");
  const enterButton = document.getElementById("enter-button");
  const errorMessage = document.getElementById("error-message");
  const loader = document.getElementById("loader");
  const arContainer = document.getElementById("ar-container");
  const scanningIndicator = document.getElementById("scanning-indicator");
  let arSceneEl = null;

  const validPassword = "Harish";

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
          `%c[MARKER_CHECK] FAIL: AR.js 'marker' component NOT present on ${markerId} (or no data).`,
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

  function setupModelAndMarkerListeners() {
    console.log(
      "[LISTENERS_SETUP] Attempting to setup model and AR.js marker event listeners."
    );

    const markers = {
      "marker-elephant": document.getElementById("marker-elephant"),
      "marker-lion": document.getElementById("marker-lion"),
      "marker-monkey": document.getElementById("marker-monkey"),
      "marker-panda": document.getElementById("marker-panda"),
    };

    const models = {
      "model-elephant": document.getElementById("model-elephant"),
      "model-lion": document.getElementById("model-lion"),
      "model-monkey": document.getElementById("model-monkey"),
      "model-panda": document.getElementById("model-panda"),
    };

    let allMarkersReady = true;
    for (const markerId in markers) {
      if (!checkMarkerComponent(markerId)) {
        allMarkersReady = false;
      }
      const markerEl = markers[markerId];
      if (markerEl) {
        markerEl.addEventListener("markerFound", () => {
          console.log(
            `%c[AR_EVENT] MARKER FOUND: ${markerEl.id}`,
            "color: blue; font-weight: bold;"
          );
          const modelEl = models[markerEl.id.replace("marker-", "model-")];
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
            modelEl.setAttribute("visible", true);
          }
        });
        markerEl.addEventListener("markerLost", () => {
          console.log(
            `%c[AR_EVENT] MARKER LOST: ${markerEl.id}`,
            "color: orange;"
          );
          const modelEl = models[markerEl.id.replace("marker-", "model-")];
          if (modelEl) {
            modelEl.setAttribute("visible", false);
          }
        });
        console.log(
          `[LISTENERS_SETUP] Event listeners for marker ${markerEl.id} attached.`
        );
      } else {
        console.error(
          `[LISTENERS_SETUP] Marker element ${markerId} not found.`
        );
      }
    }

    if (!allMarkersReady) {
      console.warn(
        "[LISTENERS_SETUP] Not all AR.js marker components seem to be active. Marker detection might fail."
      );
    }

    for (const modelId in models) {
      const modelEl = models[modelId];
      if (modelEl) {
        modelEl.addEventListener("model-loaded", (event) => {
          console.log(
            `%c[MODEL_EVENT] SUCCESS: ${modelId} 3D model loaded.`,
            "color: green; font-weight: bold;",
            "Detail:",
            event.detail.model
          );
          const scale = modelEl.getAttribute("scale");
          const position = modelEl.getAttribute("position");
          const rotation = modelEl.getAttribute("rotation");
          console.log(`[MODEL_EVENT_DETAIL] ${modelId} Initial Attributes:`);
          console.log(
            `[MODEL_EVENT_DETAIL]   Scale: x=${scale.x}, y=${scale.y}, z=${scale.z}`
          );
          console.log(
            `[MODEL_EVENT_DETAIL]   Position: x=${position.x}, y=${position.y}, z=${position.z}`
          );
          console.log(
            `[MODEL_EVENT_DETAIL]   Rotation: x=${rotation.x}, y=${rotation.y}, z=${rotation.z}`
          );
        });
        modelEl.addEventListener("model-error", (event) => {
          console.error(
            `%c[MODEL_EVENT] ERROR: ${modelId} 3D model failed to load.`,
            "color: red; font-weight: bold;",
            "Src:",
            event.detail.src
          );
        });
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

  enterButton.addEventListener("click", () => {
    console.log("[PASSCODE_FLOW] Enter AR button clicked.");
    const enteredPasscode = passcodeInput.value.trim();

    if (enteredPasscode === validPassword) {
      console.log("[PASSCODE_FLOW] Access Granted");

      passcodeInput.disabled = true; // Disable the input field
      enterButton.disabled = true; // Disable the button
      errorMessage.textContent = ""; // Clear any error messages

      landingPage.classList.add("hidden"); // Start fade out
      // After the opacity transition (0.5s in CSS), set display to none
      setTimeout(() => {
        landingPage.style.display = "none";
      }, 500);

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
          return;
        }

        console.log(
          '[PASSCODE_FLOW] Waiting for A-Frame scene "loaded" and AR.js "arjs-video-loaded" events...'
        );

        let sceneLoaded = false;
        let arVideoLoaded = false;

        function tryInitMainLogic() {
          if (sceneLoaded && arVideoLoaded) {
            console.log(
              "%c[SYSTEM_READY] Both A-Frame scene AND AR.js video are loaded. Initializing main listeners.",
              "background: #222; color: #bada55; font-weight: bold"
            );
            setupModelAndMarkerListeners();
            scanningIndicator.style.display = "block";
          }
        }

        if (arSceneEl.hasLoaded) {
          console.log(
            "[PASSCODE_FLOW_INFO] A-Frame scene.hasLoaded is already true."
          );
          sceneLoaded = true;
          tryInitMainLogic();
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

        setTimeout(() => {
          loader.classList.add("hidden");
          setTimeout(() => (loader.style.display = "none"), 500);
        }, 5000); // Keep loader for 5s
      }, 500); // Delay for landing page transition
    } else {
      errorMessage.textContent = "Invalid password. Try again.";
      passcodeInput.style.animation = "shake 0.5s ease";
      setTimeout(() => (passcodeInput.style.animation = ""), 500);
    }
  });

  passcodeInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") enterButton.click();
  });

  // Check if shake animation is already defined, if not, insert it.
  // This is mostly for robustness, as it's defined in style.css
  if (document.styleSheets.length > 0 && document.styleSheets[0].cssRules) {
    if (
      ![...document.styleSheets[0].cssRules].some(
        (rule) => rule.type === CSSRule.KEYFRAMES_RULE && rule.name === "shake"
      )
    ) {
      try {
        document.styleSheets[0].insertRule(
          `@keyframes shake {0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); }}`,
          document.styleSheets[0].cssRules.length
        );
        console.log("Shake animation CSS rule inserted via JS.");
      } catch (e) {
        console.warn("Could not insert shake animation rule via JS:", e);
      }
    }
  } else {
    console.warn("Stylesheet not available for shake animation check via JS.");
  }

  console.log("Initial script setup complete.");
});
