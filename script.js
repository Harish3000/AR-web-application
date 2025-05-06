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
  const arScene = document.getElementById("ar-scene"); // Get the scene element

  // --- Config ---
  const validAnimals = ["bird", "dino"];
  console.log("Valid animals:", validAnimals);

  // --- Function to setup AR listeners (call after AR scene is ready) ---
  function setupARListeners() {
    console.log("Attempting to setup AR listeners.");

    if (!arScene) {
      console.error("AR Scene element not found! Cannot setup listeners.");
      return;
    }

    // Defensive check for AR.js and its VERSION property
    if (AFRAME.AR_JS && AFRAME.AR_JS.VERSION) {
      console.log(
        "AR Scene fully initialized. AR.js version:",
        AFRAME.AR_JS.VERSION,
        "A-Frame version:",
        AFRAME.version
      );
    } else {
      console.warn(
        "AFRAME.AR_JS or its VERSION property is not available yet. A-Frame version:",
        AFRAME.version
      );
      console.warn(
        "This might indicate AR.js did not load or initialize correctly, or this function was called too early."
      );
    }

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
        console.log(`Setting up listeners for ${markerId}`);
        markerEl.addEventListener("markerFound", () => {
          console.log(`SUCCESS: ${markerId} found!`);
          const modelEl = models[markerId.replace("marker-", "model-")];
          if (modelEl) {
            console.log(
              `Model associated with ${markerId}: ${
                modelEl.id
              }, visible: ${modelEl.getAttribute("visible")}, scale:`,
              modelEl.getAttribute("scale"),
              "position:",
              modelEl.getAttribute("position")
            );
            // Explicitly make model visible when marker is found (AR.js sometimes handles this, but being explicit can help)
            modelEl.setAttribute("visible", "true");
          }
        });
        markerEl.addEventListener("markerLost", () => {
          console.log(`INFO: ${markerId} lost.`);
          const modelEl = models[markerId.replace("marker-", "model-")];
          if (modelEl) {
            // Explicitly hide model when marker is lost
            modelEl.setAttribute("visible", "false");
          }
        });
      } else {
        console.error(`ERROR: Marker element with ID ${markerId} not found!`);
      }
    }

    for (const modelId in models) {
      const modelEl = models[modelId];
      if (modelEl) {
        console.log(`Setting up listeners for ${modelId}`);
        // Initially hide models until their marker is found
        modelEl.setAttribute("visible", "false");

        modelEl.addEventListener("model-loaded", (event) => {
          console.log(
            `SUCCESS: ${modelId} 3D model loaded successfully. Detail:`,
            event.detail.model
          );
          console.log(
            `${modelId} - Initial Scale:`,
            modelEl.getAttribute("scale"),
            "Position:",
            modelEl.getAttribute("position"),
            "Rotation:",
            modelEl.getAttribute("rotation")
          );
        });
        modelEl.addEventListener("model-error", (event) => {
          console.error(
            `ERROR: ${modelId} 3D model failed to load. Error:`,
            event.detail.src,
            event
          );
        });
      } else {
        console.error(`ERROR: Model entity with ID ${modelId} not found!`);
      }
    }
    console.log("AR Listeners setup complete.");
  }

  // --- Event Listener for Passcode ---
  enterButton.addEventListener("click", () => {
    console.log("Enter AR button clicked.");
    const enteredPasscode = passcode_input.value.trim().toLowerCase();
    console.log("Passcode entered:", enteredPasscode);

    errorMessage.textContent = "";

    if (validAnimals.includes(enteredPasscode)) {
      console.log("Access Granted for:", enteredPasscode);
      landingPage.classList.add("hidden");
      console.log("Landing page hidden.");

      loader.style.display = "flex";
      loader.classList.remove("hidden");
      console.log("Loader shown.");

      setTimeout(() => {
        console.log("Attempting to display AR container.");
        arContainer.style.display = "block";
        console.log(
          "AR container display set to block. A-Frame scene should start initializing."
        );

        // ALWAYS wait for the A-Frame scene's 'loaded' event for AR.js related setups
        if (arScene) {
          if (arScene.hasLoaded) {
            // If scene is already loaded (e.g. re-entering AR), still best to re-setup listeners
            // or ensure they are robust. For simplicity, we re-attach to loaded or call directly.
            // However, the 'loaded' event only fires once by default.
            // A more robust way if re-entering is needed would be more complex.
            // For initial entry, waiting for 'loaded' is key.
            console.log(
              "AR Scene .hasLoaded is true. Setting up AR listeners directly for robustness or re-entry."
            );
            // It's generally safer to always use the 'loaded' event for the *first* time.
            // If this path is taken because of how fast things load, it should be fine,
            // but relying on 'loaded' event is the primary mechanism.
            // Let's still prefer the 'loaded' event listener to ensure everything is set.
            arScene.addEventListener(
              "loaded",
              () => {
                console.log(
                  'AR Scene "loaded" event fired (even if .hasLoaded was true). Now setting up AR listeners.'
                );
                setupARListeners();
              },
              { once: true }
            ); // Ensure it only runs once per scene load
            // If the 'loaded' event has already fired for this scene instance, the above might not fire again.
            // A quick check: if scene is loaded and our main function hasn't run, run it.
            // This part can be tricky with re-initialization logic.
            // Let's simplify and rely on the 'loaded' event primarily.
            // The below check is if 'loaded' has ALREADY fired and we missed it.
            if (
              arScene.is("loaded") &&
              typeof arScene.userData.arListenersSetup === "undefined"
            ) {
              console.log(
                'AR Scene is already "loaded" (state). Calling setupARListeners.'
              );
              setupARListeners();
              arScene.userData.arListenersSetup = true; // Mark as setup
            }
          } else {
            console.log(
              'AR Scene not yet loaded, adding event listener for "loaded" event.'
            );
            arScene.addEventListener(
              "loaded",
              () => {
                console.log(
                  'AR Scene "loaded" event fired. Now setting up AR listeners.'
                );
                setupARListeners();
                arScene.userData.arListenersSetup = true; // Mark as setup
              },
              { once: true }
            );
          }
        } else {
          console.error(
            "AR Scene element not found when trying to add 'loaded' listener."
          );
        }

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
              console.log("Camera access granted and stream obtained.");
              stream.getTracks().forEach((track) => track.stop());
            })
            .catch((err) => {
              console.error("ERROR accessing camera:", err.name, err.message);
              // alert("Error accessing camera: " + err.message + ". Please ensure you are on HTTPS and have granted camera permissions.");
            });
        } else {
          console.warn("navigator.mediaDevices.getUserMedia not supported.");
        }

        setTimeout(() => {
          loader.classList.add("hidden");
          console.log("Loader hidden.");
          setTimeout(() => {
            loader.style.display = "none";
          }, 500);
        }, 3000);
      }, 500);
    } else {
      console.log("Access Denied. Invalid passcode:", enteredPasscode);
      errorMessage.textContent = 'Invalid animal name. Try "bird" or "dino".';
      passcode_input.style.animation = "shake 0.5s ease";
      setTimeout(() => {
        passcode_input.style.animation = "";
      }, 500);
    }
  });

  passcode_input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      console.log("Enter key pressed in passcode input.");
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
    console.warn("Stylesheet not accessible to insert shake animation.");
  }
  console.log("Initial script setup complete.");
});
