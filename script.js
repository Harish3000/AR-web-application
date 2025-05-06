// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.");

  const landingPage = document.getElementById("landing-page");
  const passcode_input = document.getElementById("passcode-input");
  const enterButton = document.getElementById("enter-button");
  const errorMessage = document.getElementById("error-message");
  const loader = document.getElementById("loader");
  const arContainer = document.getElementById("ar-container");
  const arFeedbackEl = document.getElementById("ar-feedback"); // 3. Get feedback element
  let arSceneEl = null;

  // 1. Hardcoded password
  const correctPassword = "Harish";
  console.log("Password set.");

  function showArFeedback(message, isError = false) {
    if (arFeedbackEl) {
      arFeedbackEl.textContent = message;
      arFeedbackEl.classList.add("visible");
      arFeedbackEl.style.backgroundColor = isError
        ? "rgba(200, 0, 0, 0.75)"
        : "rgba(0, 0, 0, 0.75)";
    }
  }

  function hideArFeedback() {
    if (arFeedbackEl) {
      arFeedbackEl.classList.remove("visible");
    }
  }

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
      "marker-bird": {
        el: document.getElementById("marker-bird"),
        name: "Bird",
      },
      "marker-dino": {
        el: document.getElementById("marker-dino"),
        name: "Dinosaur",
      },
    };

    const models = {
      "model-bird": document.getElementById("model-bird"),
      "model-dino": document.getElementById("model-dino"),
    };

    let allMarkersReady = true;
    for (const markerId in markers) {
      if (!checkMarkerComponent(markerId)) {
        allMarkersReady = false;
      }
      const markerData = markers[markerId];
      const markerEl = markerData.el;

      if (markerEl) {
        markerEl.addEventListener("markerFound", () => {
          const animalName = markerData.name;
          console.log(
            `%c[AR_EVENT] MARKER FOUND: ${markerEl.id} (${animalName})`,
            "color: blue; font-weight: bold;"
          );
          // 3. Visual feedback for QR scanned successfully
          showArFeedback(`Marker for ${animalName} detected!`);

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
            modelEl.setAttribute("visible", "true");
          }
        });

        markerEl.addEventListener("markerLost", () => {
          const animalName = markerData.name;
          console.log(
            `%c[AR_EVENT] MARKER LOST: ${markerEl.id} (${animalName})`,
            "color: orange;"
          );
          // 3. Visual feedback for scanning
          showArFeedback("Scanning for markers...");
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
      showArFeedback("AR system error. Please refresh.", true);
    } else {
      // Initial feedback when AR starts
      showArFeedback("Point your camera at a marker pattern.");
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
          // ... (rest of model loaded logs)
        });
        modelEl.addEventListener("model-error", (event) => {
          console.error(
            `%c[MODEL_EVENT] ERROR: ${modelId} 3D model failed to load.`,
            "color: red; font-weight: bold;",
            "Src:",
            event.detail.src
          );
          showArFeedback(`Error loading ${modelId}. Check console.`, true);
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
    const enteredPasscode = passcode_input.value.trim(); // Keep case for password

    // 1. Check against hardcoded password
    if (enteredPasscode === correctPassword) {
      console.log("[PASSCODE_FLOW] Access Granted.");
      errorMessage.textContent = ""; // Clear any previous error
      landingPage.classList.add("hidden");

      // Hide landing page after transition
      setTimeout(() => {
        landingPage.style.display = "none";
      }, 500);

      loader.style.display = "flex"; // Use flex as per CSS
      loader.classList.remove("hidden"); // Ensure it's visible if hidden class was added

      setTimeout(() => {
        arContainer.style.display = "block";
        console.log("[PASSCODE_FLOW] AR container display set to block.");

        arSceneEl = document.getElementById("ar-scene");
        if (!arSceneEl) {
          console.error(
            "[PASSCODE_FLOW_ERROR] AR Scene element (ar-scene) not found!"
          );
          showArFeedback("AR Scene Error! Please refresh.", true);
          loader.classList.add("hidden");
          setTimeout(() => (loader.style.display = "none"), 500);
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
            loader.classList.add("hidden");
            setTimeout(() => {
              loader.style.display = "none";
            }, 500); // Hide loader after its transition
          }
        }

        if (arSceneEl.hasLoaded) {
          console.log(
            "[PASSCODE_FLOW_INFO] A-Frame scene.hasLoaded is already true."
          );
          sceneLoaded = true;
          // tryInitMainLogic(); // Wait for video too
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

        // Fallback timeout for loader in case something goes wrong with events
        // This timeout will now primarily act as a safety net if events are severely delayed.
        // The main hiding logic is in tryInitMainLogic.
        setTimeout(() => {
          if (!sceneLoaded || !arVideoLoaded) {
            console.warn(
              "[LOADER_TIMEOUT] Fallback: Hiding loader as AR events might be stuck."
            );
            loader.classList.add("hidden");
            setTimeout(() => (loader.style.display = "none"), 500);
            if (!arVideoLoaded)
              showArFeedback("Camera/AR video failed to load.", true);
          }
        }, 10000); // Increased timeout slightly to 10s
      }, 500); // Delay for AR container to show after loader
    } else {
      errorMessage.textContent = "Incorrect password. Please try again.";
      passcode_input.style.animation = "shake 0.5s ease";
      setTimeout(() => (passcode_input.style.animation = ""), 500);
    }
  });

  passcode_input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission if it were in a form
      enterButton.click();
    }
  });

  // Shake animation CSS is now in style.css, so JS rule insertion is removed.
  console.log("Initial script setup complete. Shake animation defined in CSS.");
});
