document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.");

  const landingPage = document.getElementById("landing-page");
  const passcodeInput = document.getElementById("passcode-input");
  const enterButton = document.getElementById("enter-button");
  const errorMessage = document.getElementById("error-message");
  const loader = document.getElementById("loader");
  const arContainer = document.getElementById("ar-container");
  const scanFeedback = document.getElementById("scan-feedback");
  const successFeedback = document.getElementById("success-feedback");
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
        markerEl.addEventListener("markerFound", () => {
          console.log(
            `%c[AR_EVENT] MARKER FOUND: ${markerEl.id}`,
            "color: blue; font-weight: bold;"
          );
          scanFeedback.style.display = "none";
          const animalName =
            markerEl.id === "marker-bird" ? "Bird" : "Dinosaur";
          successFeedback.textContent = `QR Received - This is a ${animalName}!`;
          successFeedback.style.display = "block";
          setTimeout(() => {
            successFeedback.style.display = "none";
          }, 3000);

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
          console.log(
            `%c[AR_EVENT] MARKER LOST: ${markerEl.id}`,
            "color: orange;"
          );
          scanFeedback.style.display = "block";
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
            scanFeedback.style.display = "block";
            setupModelAndMarkerListeners();
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
        }, 5000);
      }, 500);
    } else {
      errorMessage.textContent = "Invalid password. Try again.";
      passcodeInput.style.animation = "shake 0.5s ease";
      setTimeout(() => (passcodeInput.style.animation = ""), 500);
    }
  });

  passcodeInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") enterButton.click();
  });
});
