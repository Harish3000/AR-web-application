document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.");

  const landingPage = document.getElementById("landing-page");
  const passcodeInput = document.getElementById("passcode-input");
  const enterButton = document.getElementById("enter-button");
  const errorMessage = document.getElementById("error-message");
  const loader = document.getElementById("loader");
  const arContainer = document.getElementById("ar-container");
  // UI elements for AR will be handled by the scene-controller component

  const validPassword = "Harish";
  let arSceneEl = null;

  // Component for individual markers to track their visibility
  AFRAME.registerComponent("animal-handler", {
    schema: {
      animalName: { type: "string", default: "Animal" },
      audioId: { type: "string" }, // ID of the <audio> element in a-assets
    },
    init: function () {
      this.isMarkerCurrentlyVisible = false;
      // console.log(`Animal Handler for ${this.data.animalName} initialized (Marker ID: ${this.el.id}, Audio ID: ${this.data.audioId}).`);
    },
    tick: function () {
      // Update visibility status based on AR.js internal state
      if (this.el.object3D.visible) {
        this.isMarkerCurrentlyVisible = true;
      } else {
        this.isMarkerCurrentlyVisible = false;
      }
    },
  });

  // Component to manage overall scene UI based on marker visibility
  let currentPlayingAudioElement = null; // Global reference to the <audio> element

  AFRAME.registerComponent("scene-controller", {
    init: function () {
      console.log("Scene Controller Initialized.");
      this.markerHandlers = []; // To store references to animal-handler components
      this.uiAudioControl = document.getElementById("audio-control");
      this.uiScanningIndicator = document.getElementById("scanning-indicator");
      this.uiSuccessMessage = document.getElementById("success-message");
      this.uiSuccessText = document.getElementById("success-text");

      this.currentlyActiveAnimalName = null; // Tracks the name of the animal whose UI is active
      this.currentlyActiveAudioId = null; // Tracks the audioId for the active animal

      // Populate markerHandlers once the scene is loaded
      this.el.sceneEl.addEventListener("loaded", () => {
        const markerElements = Array.from(
          this.el.sceneEl.querySelectorAll("a-marker[animal-handler]")
        );
        this.markerHandlers = markerElements
          .map((mEl) => {
            if (mEl.components["animal-handler"]) {
              return mEl.components["animal-handler"];
            }
            return null;
          })
          .filter((handler) => handler !== null); // Filter out any nulls if component not ready

        if (this.markerHandlers.length === 0) {
          console.warn(
            "Scene Controller: No markers with 'animal-handler' component found after scene load."
          );
        } else {
          console.log(
            "Scene Controller: Found marker handlers:",
            this.markerHandlers.map((h) => h.data.animalName)
          );
        }
      });

      // Setup click listener for the audio icon
      this.uiAudioControl.addEventListener("click", () => {
        if (this.currentlyActiveAudioId) {
          const audioEl = document.getElementById(this.currentlyActiveAudioId);
          if (audioEl) {
            console.log(
              `Audio icon clicked for ${this.currentlyActiveAnimalName}. Playing sound.`
            );
            audioEl.currentTime = 0; // Play from the beginning
            audioEl
              .play()
              .catch((error) => console.error("Error playing sound:", error));
          } else {
            console.error(
              `Audio element with ID ${this.currentlyActiveAudioId} not found for ${this.currentlyActiveAnimalName}.`
            );
          }
        }
      });
    },

    tick: function () {
      if (this.markerHandlers.length === 0 && this.el.sceneEl.hasLoaded) {
        // Attempt to re-populate if empty after scene load (e.g., dynamic markers, though not in this example)
        // This is a fallback, ideally `loaded` event handles it.
        const markerElements = Array.from(
          this.el.sceneEl.querySelectorAll("a-marker[animal-handler]")
        );
        this.markerHandlers = markerElements
          .map((mEl) => mEl.components["animal-handler"])
          .filter((h) => h);
      }

      let visibleAnimalHandler = null;

      // Prioritize the currently active animal if it's still visible
      if (this.currentlyActiveAnimalName) {
        const lastActiveHandler = this.markerHandlers.find(
          (h) => h.data.animalName === this.currentlyActiveAnimalName
        );
        if (lastActiveHandler && lastActiveHandler.isMarkerCurrentlyVisible) {
          visibleAnimalHandler = lastActiveHandler;
        }
      }

      // If the last active is not visible, find any other visible marker
      if (!visibleAnimalHandler) {
        for (const handler of this.markerHandlers) {
          if (handler.isMarkerCurrentlyVisible) {
            visibleAnimalHandler = handler;
            break; // Found a visible marker, make it active
          }
        }
      }

      if (visibleAnimalHandler) {
        // A marker is visible
        const newAnimalName = visibleAnimalHandler.data.animalName;
        const newAudioId = visibleAnimalHandler.data.audioId;

        if (this.currentlyActiveAnimalName !== newAnimalName) {
          // console.log(`UI Switched to: ${newAnimalName}`);
          // If a different animal becomes active, pause the previously playing sound (if any)
          if (
            currentPlayingAudioElement &&
            this.currentlyActiveAudioId !== newAudioId
          ) {
            currentPlayingAudioElement.pause();
            currentPlayingAudioElement.currentTime = 0;
          }
          this.currentlyActiveAnimalName = newAnimalName;
          this.currentlyActiveAudioId = newAudioId;
          currentPlayingAudioElement = document.getElementById(
            this.currentlyActiveAudioId
          );
        }

        this.uiSuccessText.textContent = `${this.currentlyActiveAnimalName} Detected.`;
        this.uiScanningIndicator.style.display = "none";
        this.uiSuccessMessage.style.display = "block";
        this.uiAudioControl.style.display = "flex";
      } else {
        // No markers are visible
        if (this.currentlyActiveAnimalName !== null) {
          // If an animal *was* active
          // console.log(`All markers lost. UI resetting. Was: ${this.currentlyActiveAnimalName}`);
          if (currentPlayingAudioElement) {
            currentPlayingAudioElement.pause();
            currentPlayingAudioElement.currentTime = 0;
          }
          currentPlayingAudioElement = null;
          this.currentlyActiveAnimalName = null;
          this.currentlyActiveAudioId = null;
        }
        this.uiScanningIndicator.style.display = "block";
        this.uiSuccessMessage.style.display = "none";
        this.uiAudioControl.style.display = "none";
      }
    },
  });

  // --- Standard Page Logic (Password, Loader) ---
  enterButton.addEventListener("click", () => {
    console.log("[PASSCODE_FLOW] Enter AR button clicked.");
    const enteredPasscode = passcodeInput.value.trim();

    if (enteredPasscode === validPassword) {
      console.log("[PASSCODE_FLOW] Access Granted");
      passcodeInput.disabled = true;
      enterButton.disabled = true;
      errorMessage.textContent = "";

      landingPage.classList.add("hidden");
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
          loader.style.display = "none";
          return;
        }

        // A-Frame scene loading and AR.js video loading are handled internally by A-Frame.
        // The `scene-controller`'s `init` and `tick` will start when A-Frame is ready.
        // We just need to make sure the loader doesn't hide too soon.
        console.log(
          "[PASSCODE_FLOW] AR Scene setup. scene-controller will manage AR UI."
        );

        // Hide loader after a delay, assuming AR will be ready.
        // A more robust way would be to listen for an event from scene-controller or arjs-video-loaded.
        const arReadyTimeout = 10000; // Max wait for AR before hiding loader
        const checkARReadyInterval = 500;
        let timeWaited = 0;

        const arReadyCheck = setInterval(() => {
          timeWaited += checkARReadyInterval;
          const videoEl = document.querySelector("video"); // AR.js creates a video element
          if (
            (arSceneEl.hasLoaded && videoEl && videoEl.readyState >= 2) ||
            timeWaited >= arReadyTimeout
          ) {
            // readyState 2: HAVE_CURRENT_DATA
            clearInterval(arReadyCheck);
            console.log(
              `%c[SYSTEM_READY] AR system likely ready (hasLoaded: ${
                arSceneEl.hasLoaded
              }, videoReady: ${
                videoEl ? videoEl.readyState : "N/A"
              }). Hiding loader.`,
              "color: green;"
            );
            loader.classList.add("hidden");
            setTimeout(() => (loader.style.display = "none"), 500);
            if (timeWaited >= arReadyTimeout) {
              console.warn(
                "[LOADER] Loader hidden due to timeout. AR system might not be fully initialized."
              );
            }
          } else {
            console.log(
              `[LOADER] Waiting for AR... (hasLoaded: ${
                arSceneEl.hasLoaded
              }, videoReady: ${videoEl ? videoEl.readyState : "N/A"})`
            );
          }
        }, checkARReadyInterval);
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
      } catch (e) {
        // Silently ignore if rule insertion fails (e.g., security policies)
      }
    }
  }

  console.log("Initial script setup complete.");
});
