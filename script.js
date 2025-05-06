// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.");

  // --- Elements ---
  const landingPage = document.getElementById("landing-page");
  const passcode_input = document.getElementById("passcode-input");
  const enterButton = document.getElementById("enter-button");
  const errorMessage = document.getElementById("error-message");
  const loader = document.getElementById("loader");
  const arContainer = document.getElementById("ar-container");
  let arScene = null; // Will be assigned later

  // --- Config ---
  const validAnimals = ["bird", "dino"];
  console.log("Valid animals:", validAnimals);

  // --- Function to setup AR listeners (call after AR scene is ready) ---
  function setupARListeners() {
    console.log("[SETUP_AR_LISTENERS_START] Attempting to setup AR listeners.");

    arScene = document.getElementById("ar-scene"); // Ensure arScene is fresh
    if (!arScene) {
      console.error(
        "[SETUP_AR_LISTENERS_ERROR] AR Scene element (ar-scene) NOT FOUND! Cannot setup listeners."
      );
      return;
    }
    console.log("[SETUP_AR_LISTENERS_INFO] AR Scene element found.");

    if (!arScene.hasLoaded) {
      console.warn(
        '[SETUP_AR_LISTENERS_WARN] AR Scene .hasLoaded is false. Listeners might not attach correctly yet. This should ideally be true if called from scene "loaded" event.'
      );
    }

    console.log(
      "[SETUP_AR_LISTENERS_INFO] AR.js version:",
      AFRAME.AR_JS.VERSION,
      "A-Frame version:",
      AFRAME.version
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
        console.log(
          `[SETUP_AR_LISTENERS_INFO] Found marker element: ${markerId}. Setting up listeners.`
        );
        markerEl.addEventListener("markerFound", () => {
          console.log(
            `%c[MARKER_EVENT] SUCCESS: ${markerId} found!`,
            "color: green; font-weight: bold;"
          );
          const modelEl = models[markerId.replace("marker-", "model-")];
          if (modelEl) {
            console.log(
              `[MARKER_EVENT_DETAIL] Model for ${markerId}: ${
                modelEl.id
              }, visible: ${modelEl.getAttribute("visible")}, scale:`,
              modelEl.getAttribute("scale"),
              "position:",
              modelEl.getAttribute("position")
            );
            // Force visibility on markerFound for testing
            // modelEl.setAttribute('visible', 'true');
            // console.log(`[MARKER_EVENT_DETAIL] Model ${modelEl.id} visibility forced to true.`);
          } else {
            console.error(
              `[MARKER_EVENT_ERROR] No model entity found for ${markerId}`
            );
          }
        });
        markerEl.addEventListener("markerLost", () => {
          console.log(
            `%c[MARKER_EVENT] INFO: ${markerId} lost.`,
            "color: orange;"
          );
        });
        console.log(
          `[SETUP_AR_LISTENERS_INFO] Listeners for ${markerId} attached.`
        );
      } else {
        console.error(
          `[SETUP_AR_LISTENERS_ERROR] Marker element with ID ${markerId} NOT FOUND!`
        );
      }
    }

    for (const modelId in models) {
      const modelEl = models[modelId];
      if (modelEl) {
        console.log(
          `[SETUP_AR_LISTENERS_INFO] Found model entity: ${modelId}. Setting up listeners.`
        );
        modelEl.addEventListener("model-loaded", (event) => {
          console.log(
            `%c[MODEL_EVENT] SUCCESS: ${modelId} 3D model loaded successfully.`,
            "color: green; font-weight: bold;",
            "Detail:",
            event.detail.model
          );
          console.log(
            `[MODEL_EVENT_DETAIL] ${modelId} - Scale:`,
            modelEl.getAttribute("scale"),
            "Position:",
            modelEl.getAttribute("position"),
            "Rotation:",
            modelEl.getAttribute("rotation")
          );
        });
        modelEl.addEventListener("model-error", (event) => {
          console.error(
            `%c[MODEL_EVENT] ERROR: ${modelId} 3D model failed to load.`,
            "color: red; font-weight: bold;",
            "Error Src:",
            event.detail.src,
            "Event:",
            event
          );
        });
        console.log(
          `[SETUP_AR_LISTENERS_INFO] Listeners for ${modelId} attached.`
        );
      } else {
        console.error(
          `[SETUP_AR_LISTENERS_ERROR] Model entity with ID ${modelId} NOT FOUND!`
        );
      }
    }
    console.log("[SETUP_AR_LISTENERS_END] Finished setting up AR listeners.");
  }

  // --- Event Listener for Passcode ---
  enterButton.addEventListener("click", () => {
    console.log("[PASSCODE_FLOW] Enter AR button clicked.");
    const enteredPasscode = passcode_input.value.trim().toLowerCase();
    console.log("[PASSCODE_FLOW] Passcode entered:", enteredPasscode);

    errorMessage.textContent = "";

    if (validAnimals.includes(enteredPasscode)) {
      console.log("[PASSCODE_FLOW] Access Granted for:", enteredPasscode);
      landingPage.classList.add("hidden");
      console.log("[PASSCODE_FLOW] Landing page hidden.");

      loader.style.display = "flex";
      loader.classList.remove("hidden");
      console.log("[PASSCODE_FLOW] Loader shown.");

      setTimeout(() => {
        console.log("[PASSCODE_FLOW] Attempting to display AR container.");
        arContainer.style.display = "block";
        console.log(
          "[PASSCODE_FLOW] AR container display set to block. A-Frame scene should start initializing."
        );

        arScene = document.getElementById("ar-scene"); // Get arScene element reference
        if (!arScene) {
          console.error(
            "[PASSCODE_FLOW_ERROR] AR Scene element (ar-scene) not found immediately after display block!"
          );
          // Try to wait a bit more if it's not immediately available (though it should be)
          setTimeout(() => {
            arScene = document.getElementById("ar-scene");
            if (arScene) {
              console.log(
                "[PASSCODE_FLOW_INFO] AR Scene element found after slight delay."
              );
              initArSceneLogic();
            } else {
              console.error(
                "[PASSCODE_FLOW_ERROR] AR Scene element STILL NOT FOUND after delay!"
              );
            }
          }, 100); // Short delay
          return; // Don't proceed if scene isn't found
        }

        function initArSceneLogic() {
          console.log("[PASSCODE_FLOW_INFO] arScene element is available.");
          if (arScene.hasLoaded) {
            console.log(
              "[PASSCODE_FLOW_INFO] AR Scene .hasLoaded is true. Setting up AR listeners directly."
            );
            setupARListeners();
          } else {
            console.log(
              '[PASSCODE_FLOW_WARN] AR Scene not yet loaded (.hasLoaded is false). Adding event listener for "loaded" event.'
            );
            arScene.addEventListener(
              "loaded",
              () => {
                console.log(
                  '%c[SCENE_EVENT] AR Scene "loaded" event fired. Now setting up AR listeners.',
                  "color: blue; font-weight: bold;"
                );
                setupARListeners();
              },
              { once: true }
            );
          }
        }
        initArSceneLogic();

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
              console.log(
                "[PASSCODE_FLOW_INFO] Camera access granted and stream obtained (test)."
              );
              stream.getTracks().forEach((track) => track.stop());
            })
            .catch((err) => {
              console.error(
                "[PASSCODE_FLOW_ERROR] Error accessing camera:",
                err.name,
                err.message
              );
              // alert("Error accessing camera: " + err.message + ". Please ensure you are on HTTPS and have granted camera permissions.");
            });
        } else {
          console.warn(
            "[PASSCODE_FLOW_WARN] navigator.mediaDevices.getUserMedia not supported."
          );
        }

        setTimeout(() => {
          loader.classList.add("hidden");
          console.log("[PASSCODE_FLOW] Loader hidden.");
          setTimeout(() => {
            loader.style.display = "none";
          }, 500);
        }, 3000);
      }, 500);
    } else {
      console.log(
        "[PASSCODE_FLOW_ERROR] Access Denied. Invalid passcode:",
        enteredPasscode
      );
      errorMessage.textContent = 'Invalid animal name. Try "bird" or "dino".';
      passcode_input.style.animation = "shake 0.5s ease";
      setTimeout(() => {
        passcode_input.style.animation = "";
      }, 500);
    }
  });

  passcode_input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      console.log("[PASSCODE_INPUT] Enter key pressed.");
      enterButton.click();
    }
  });

  // Ensure shake animation CSS is present
  if (document.styleSheets.length > 0 && document.styleSheets[0].cssRules) {
    if (
      ![...document.styleSheets[0].cssRules].some(
        (rule) => rule.name === "shake"
      )
    ) {
      const styleSheet = document.styleSheets[0];
      try {
        styleSheet.insertRule(
          `
                  @keyframes shake {
                      0%, 100% { transform: translateX(0); }
                      25% { transform: translateX(-5px); }
                      75% { transform: translateX(5px); }
                  }
              `,
          styleSheet.cssRules.length
        );
        console.log("Shake animation CSS rule inserted.");
      } catch (e) {
        console.warn(
          "Could not insert shake animation rule (might already exist or other CSS issue):",
          e
        );
      }
    }
  } else {
    console.warn(
      "Stylesheet not available or no rules, couldn't check/insert shake animation."
    );
  }
  console.log("Initial script setup complete.");
});
