// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.");

  const landingPage = document.getElementById("landing-page");
  const passcode_input = document.getElementById("passcode-input");
  const enterButton = document.getElementById("enter-button");
  const errorMessage = document.getElementById("error-message");
  const loader = document.getElementById("loader");
  const arContainer = document.getElementById("ar-container");
  const arFeedbackOverlay = document.getElementById("ar-feedback-overlay");
  let arSceneEl = null;

  const correctPassword = "Harish"; // Hardcoded password
  console.log("Password set.");

  function checkMarkerComponent(markerId) {
    const markerEl = document.getElementById(markerId);
    if (markerEl) {
      if (
        markerEl.getAttribute("arjs-marker") ||
        (markerEl.components && markerEl.components.marker)
      ) {
        console.log(
          `%c[MARKER_CHECK] INFO: AR.js marker attributes or component present for ${markerId}.`,
          "color: green;"
        );
        return true;
      } else {
        console.warn(
          `%c[MARKER_CHECK] NOTE: AR.js 'marker' component data not immediately available for ${markerId}. Events are key.`,
          "color: orange;"
        );
        return true;
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
      "marker-bird": document.getElementById("marker-bird"),
      "marker-dino": document.getElementById("marker-dino"),
    };

    const models = {
      "model-bird": document.getElementById("model-bird"),
      "model-dino": document.getElementById("model-dino"),
    };

    Object.values(models).forEach((modelEl) => {
      if (modelEl) modelEl.setAttribute("visible", "false");
    });

    let allMarkersReady = true;
    for (const markerId in markers) {
      if (!checkMarkerComponent(markerId)) {
        allMarkersReady = false;
      }
      const markerEl = markers[markerId];
      if (markerEl) {
        markerEl.addEventListener("markerFound", () => {
          const animalName = markerEl.id.replace("marker-", "");
          console.log(
            `%c[AR_EVENT] MARKER FOUND: ${markerEl.id} (${animalName})`,
            "color: blue; font-weight: bold;"
          );
          arFeedbackOverlay.textContent = `Marker Detected: ${
            animalName.charAt(0).toUpperCase() + animalName.slice(1)
          }!`;
          arFeedbackOverlay.style.display = "block";

          const modelEl = models[markerEl.id.replace("marker-", "model-")];
          if (modelEl) {
            modelEl.setAttribute("visible", "true");
            console.log(
              `[AR_EVENT_DETAIL] Model ${modelEl.id} set to visible.`
            );
          }
        });
        markerEl.addEventListener("markerLost", () => {
          const animalName = markerEl.id.replace("marker-", "");
          console.log(
            `%c[AR_EVENT] MARKER LOST: ${markerEl.id} (${animalName})`,
            "color: orange;"
          );
          arFeedbackOverlay.textContent = "Point your camera at a marker.";
          // Keep overlay visible with the new message
          arFeedbackOverlay.style.display = "block";

          const modelEl = models[markerEl.id.replace("marker-", "model-")];
          if (modelEl) {
            modelEl.setAttribute("visible", "false");
            console.log(`[AR_EVENT_DETAIL] Model ${modelEl.id} set to hidden.`);
          }
        });
        console.log(
          `[LISTENERS_SETUP] Event listeners for marker ${markerEl.id} attached.`
        );
      } else {
        console.error(
          `[LISTENERS_SETUP] Marker element ${markerId} not found.`
        );
        allMarkersReady = false;
      }
    }

    if (!allMarkersReady) {
      console.warn(
        "[LISTENERS_SETUP] Not all marker elements were found. Marker detection might be affected for missing elements."
      );
    }

    for (const modelId in models) {
      const modelEl = models[modelId];
      if (modelEl) {
        modelEl.addEventListener("model-loaded", (event) => {
          console.log(
            `%c[MODEL_EVENT] SUCCESS: ${modelId} 3D model loaded.`,
            "color: green; font-weight: bold;"
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
    const enteredPasscode = passcode_input.value.trim().toLowerCase();

    if (enteredPasscode === correctPassword.toLowerCase()) {
      console.log("[PASSCODE_FLOW] Access Granted.");
      errorMessage.textContent = "";
      landingPage.classList.add("hidden");
      setTimeout(() => (landingPage.style.display = "none"), 500); // Hide completely after transition

      loader.style.display = "flex";
      loader.classList.remove("hidden");

      setTimeout(() => {
        arContainer.style.display = "block"; // Show the AR container
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

        // ***** KEY CHANGE: Dynamically set arjs attribute to initialize camera *****
        arSceneEl.setAttribute(
          "arjs",
          "sourceType: webcam; debugUIEnabled: true; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
        );
        console.log(
          "[PASSCODE_FLOW] AR.js attribute set on a-scene. Camera should initialize now."
        );
        // Note: Added detectionMode and matrixCodeType as common defaults, adjust if necessary.
        // debugUIEnabled: true is kept as per original code. Set to false to hide AR.js debug canvas.

        console.log(
          '[PASSCODE_FLOW] Waiting for A-Frame scene "loaded" and AR.js "arjs-video-loaded" events...'
        );

        let sceneLoaded = false;
        let arVideoLoaded = false;

        function tryInitMainLogicAndHideLoader() {
          if (sceneLoaded && arVideoLoaded) {
            console.log(
              "%c[SYSTEM_READY] Both A-Frame scene AND AR.js video are loaded. Initializing main listeners.",
              "background: #222; color: #bada55; font-weight: bold"
            );
            setupModelAndMarkerListeners();

            loader.classList.add("hidden");
            arFeedbackOverlay.textContent = "Point your camera at a marker.";
            arFeedbackOverlay.style.display = "block";
            setTimeout(() => {
              if (loader.classList.contains("hidden")) {
                loader.style.display = "none";
              }
            }, 500); // CSS transition duration
          }
        }

        if (arSceneEl.hasLoaded) {
          console.log(
            "[PASSCODE_FLOW_INFO] A-Frame scene.hasLoaded is already true."
          );
          sceneLoaded = true;
          // If scene is already loaded, AR.js might also be ready or will fire its event soon
        } else {
          arSceneEl.addEventListener(
            "loaded",
            () => {
              console.log(
                '%c[SCENE_EVENT] A-Frame scene "loaded" event fired.',
                "color: blue; font-weight: bold;"
              );
              sceneLoaded = true;
              tryInitMainLogicAndHideLoader();
            },
            { once: true }
          );
        }

        // This event is crucial as it indicates AR.js has processed the video.
        arSceneEl.addEventListener(
          "arjs-video-loaded", // This specific event confirms video stream is ready
          () => {
            console.log(
              '%c[ARJS_EVENT] AR.js "arjs-video-loaded" event fired. Video stream should be active.',
              "color: purple; font-weight: bold;"
            );
            arVideoLoaded = true;
            tryInitMainLogicAndHideLoader();
          },
          { once: true }
        );

        // Check if AR.js is already ready (e.g. if arjs attribute was set and it initialized quickly)
        // This might happen if 'loaded' fires after 'arjs-video-loaded' or if arjs is very fast.
        if (arSceneEl.components.arjs && arSceneEl.components.arjs.video) {
          console.log(
            "%c[ARJS_EVENT_CHECK] AR.js video seems already loaded on check.",
            "color: purple;"
          );
          arVideoLoaded = true;
        }

        // Initial call in case both were true already or became true very fast
        tryInitMainLogicAndHideLoader();

        setTimeout(() => {
          if (
            loader.style.display !== "none" &&
            !(sceneLoaded && arVideoLoaded)
          ) {
            console.warn(
              "[LOADER_FALLBACK] Hiding loader due to timeout. AR events might not have all fired. sceneLoaded:",
              sceneLoaded,
              "arVideoLoaded:",
              arVideoLoaded
            );
            loader.classList.add("hidden");
            setTimeout(() => (loader.style.display = "none"), 500);
            arFeedbackOverlay.style.display = "block";
            arFeedbackOverlay.textContent = "Initializing AR...";
            // Still try to setup listeners, it might work or provide more debug info
            if (!sceneLoaded || !arVideoLoaded) {
              console.warn(
                "Attempting to setup listeners despite incomplete AR init."
              );
            }
            setupModelAndMarkerListeners();
          } else if (
            loader.style.display !== "none" &&
            sceneLoaded &&
            arVideoLoaded
          ) {
            // This case means tryInitMainLogicAndHideLoader should have hidden it
            console.log(
              "[LOADER_FALLBACK] System ready, but loader still visible. Forcing hide."
            );
            loader.classList.add("hidden");
            setTimeout(() => (loader.style.display = "none"), 500);
          }
        }, 10000);
      }, 100);
    } else {
      errorMessage.textContent = "Invalid password. Please try again.";
      passcode_input.style.animation = "shake 0.5s ease";
      setTimeout(() => {
        passcode_input.style.animation = "";
        passcode_input.focus();
        passcode_input.select();
      }, 500);
    }
  });

  passcode_input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      enterButton.click();
    }
  });

  console.log("Initial script setup complete. Waiting for user interaction.");
});
