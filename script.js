// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.");

  const landingPage = document.getElementById("landing-page");
  const passcode_input = document.getElementById("passcode-input");
  const enterButton = document.getElementById("enter-button");
  const errorMessage = document.getElementById("error-message");
  const loader = document.getElementById("loader");
  const arContainer = document.getElementById("ar-container");
  const arFeedbackEl = document.getElementById("ar-feedback"); // AR Feedback element
  let arSceneEl = null;
  let feedbackTimeout = null; // To manage feedback toast timeout

  const correctPassword = "harish"; // Hardcoded password (lowercase for case-insensitive check)
  console.log("Password check setup.");

  function showArFeedback(message, duration = 3000) {
    if (arFeedbackEl) {
      arFeedbackEl.textContent = message;
      arFeedbackEl.style.display = "block"; // Make it visible
      arFeedbackEl.classList.add("show"); // Trigger animation

      if (feedbackTimeout) {
        clearTimeout(feedbackTimeout);
      }
      if (duration > 0) {
        // duration 0 or less means persistent
        feedbackTimeout = setTimeout(() => {
          arFeedbackEl.classList.remove("show");
          // Wait for animation to complete before hiding
          setTimeout(() => {
            if (arFeedbackEl.textContent === message) {
              // Hide only if message hasn't changed
              arFeedbackEl.style.display = "none";
            }
          }, 500);
        }, duration);
      }
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
      "marker-bird": document.getElementById("marker-bird"),
      "marker-dino": document.getElementById("marker-dino"),
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
      const markerEl = markers[markerId];
      if (markerEl) {
        const animalName =
          markerEl.getAttribute("data-animal-name") || "Unknown Animal";
        markerEl.addEventListener("markerFound", () => {
          console.log(
            `%c[AR_EVENT] MARKER FOUND: ${markerEl.id}`,
            "color: blue; font-weight: bold;"
          );
          showArFeedback(`Marker for ${animalName} detected!`, 4000); // Show feedback
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
            modelEl.setAttribute("visible", "true"); // Force visible on found
          }
        });
        markerEl.addEventListener("markerLost", () => {
          console.log(
            `%c[AR_EVENT] MARKER LOST: ${markerEl.id}`,
            "color: orange;"
          );
          // Optionally, show feedback for marker lost
          // showArFeedback(`Marker for ${animalName} lost.`, 2000);
          // Or, revert to "Scanning for markers..." if no other markers are active
          // For now, debugUI gives visual indication of lost tracking.
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
    } else {
      // If all markers are ready (implies AR system is likely functional)
      // We might show "Scanning for markers..." here if not shown earlier
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
          showArFeedback(
            `Error loading model: ${modelId}. Check console.`,
            5000
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
    const enteredPasscode = passcode_input.value.trim().toLowerCase(); // Convert to lowercase for comparison

    if (enteredPasscode === correctPassword) {
      console.log("[PASSCODE_FLOW] Access Granted.");
      errorMessage.textContent = ""; // Clear any previous error
      landingPage.classList.add("hidden");
      loader.style.display = "flex";
      loader.classList.remove("hidden");

      // Ensure AR Feedback is hidden initially when AR starts
      if (arFeedbackEl) {
        arFeedbackEl.style.display = "none";
        arFeedbackEl.classList.remove("show");
      }

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
          showArFeedback("Error: AR Scene not found.", 5000);
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
            showArFeedback("Scanning for markers...", 0); // Persistent message until marker found
          }
        }

        if (arSceneEl.hasLoaded) {
          console.log(
            "[PASSCODE_FLOW_INFO] A-Frame scene.hasLoaded is already true."
          );
          sceneLoaded = true;
          // Do not call tryInitMainLogic yet, wait for arjs-video-loaded
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

        // Listen for AR.js specific event indicating video is ready
        arSceneEl.addEventListener(
          "arjs-video-loaded",
          () => {
            console.log(
              '%c[ARJS_EVENT] AR.js "arjs-video-loaded" event fired. Video stream should be active.',
              "color: purple; font-weight: bold;"
            );
            arVideoLoaded = true;
            tryInitMainLogic(); // Now try to init, scene might have loaded before or after
          },
          { once: true }
        );

        // Fallback for loader hiding
        const loaderHideTimeout = setTimeout(() => {
          loader.classList.add("hidden");
          setTimeout(() => (loader.style.display = "none"), 500);
          if (!sceneLoaded || !arVideoLoaded) {
            console.warn(
              "[LOADER_TIMEOUT] Loader hidden by timeout, but AR system might not be fully ready."
            );
            if (!arVideoLoaded)
              showArFeedback(
                "AR camera failed to load. Check permissions.",
                5000
              );
            else if (!sceneLoaded)
              showArFeedback("AR scene failed to load.", 5000);
          }
        }, 7000); // Increased timeout slightly more for slower connections/devices

        // Clear loader hide timeout if system ready
        function clearLoaderOnReady() {
          if (sceneLoaded && arVideoLoaded) {
            clearTimeout(loaderHideTimeout);
            loader.classList.add("hidden");
            setTimeout(() => (loader.style.display = "none"), 100); // Quick hide
          }
        }
        if (arSceneEl.hasLoaded)
          arSceneEl.addEventListener("arjs-video-loaded", clearLoaderOnReady, {
            once: true,
          });
        else
          arSceneEl.addEventListener(
            "loaded",
            () => {
              if (arVideoLoaded) clearLoaderOnReady();
            },
            { once: true }
          );
      }, 500);
    } else {
      errorMessage.textContent = "Invalid password. Please try again.";
      passcode_input.style.animation = "shake 0.5s ease";
      setTimeout(() => (passcode_input.style.animation = ""), 500);
    }
  });

  passcode_input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") enterButton.click();
  });

  // Shake animation CSS check (already in CSS file, but good to keep for robustness if CSS loads late)
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
        console.log("Shake animation CSS rule inserted via JS (fallback).");
      } catch (e) {
        console.warn("Could not insert shake animation rule via JS:", e);
      }
    }
  } else {
    console.warn("Stylesheet not available for shake animation check.");
  }

  console.log("Initial script setup complete.");
});
