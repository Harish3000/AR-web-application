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

    console.log(
      "AR Scene found. AR.js version:",
      AFRAME.AR_JS.VERSION,
      "A-Frame version:",
      AFRAME.version
    );

    arScene.addEventListener("loaded", () => {
      console.log("A-Frame scene reported as loaded.");
    });

    arScene.addEventListener("arjs-nft-loaded", (event) => {
      console.log("AR.js NFT system loaded (if using NFT markers):", event);
    });
    arScene.addEventListener("arjs-loaded", (event) => {
      console.log("AR.js system loaded:", event);
    });

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
          }
        });
        markerEl.addEventListener("markerLost", () => {
          console.log(`INFO: ${markerId} lost.`);
        });
      } else {
        console.error(`ERROR: Marker element with ID ${markerId} not found!`);
      }
    }

    for (const modelId in models) {
      const modelEl = models[modelId];
      if (modelEl) {
        console.log(`Setting up listeners for ${modelId}`);
        modelEl.addEventListener("model-loaded", (event) => {
          console.log(
            `SUCCESS: ${modelId} 3D model loaded successfully. Detail:`,
            event.detail.model
          );
          console.log(
            `${modelId} - Scale:`,
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
            event.detail.src
          );
        });
      } else {
        console.error(`ERROR: Model entity with ID ${modelId} not found!`);
      }
    }
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

        // IMPORTANT: Ensure AR scene is ready before attaching listeners to its children
        if (arScene.hasLoaded) {
          // A-Frame specific check
          console.log(
            "AR Scene already loaded, setting up listeners immediately."
          );
          setupARListeners();
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
            },
            { once: true }
          ); // Use { once: true } so it only fires once
        }

        // Check if camera access is an issue (more advanced, but good to know)
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
              console.log("Camera access granted and stream obtained.");
              stream.getTracks().forEach((track) => track.stop()); // Stop the test stream
            })
            .catch((err) => {
              console.error("ERROR accessing camera:", err.name, err.message);
              alert(
                "Error accessing camera: " +
                  err.message +
                  ". Please ensure you are on HTTPS and have granted camera permissions."
              );
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
        }, 3000); // Increased loading simulation time
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
  if (
    !document.styleSheets[0].cssRules.length ||
    ![...document.styleSheets[0].cssRules].some((rule) => rule.name === "shake")
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
  console.log("Initial script setup complete.");
});
