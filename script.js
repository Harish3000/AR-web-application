document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.");

  const landingPage = document.getElementById("landing-page");
  const passcodeInput = document.getElementById("passcode-input");
  const enterButton = document.getElementById("enter-button");
  const errorMessage = document.getElementById("error-message");
  const loader = document.getElementById("loader");
  const arContainer = document.getElementById("ar-container");

  const validPassword = "Harish";
  let arSceneEl = null;

  // Flashlight variables
  let isFlashlightOn = false;
  let videoTrack = null;
  const flashlightControlButton = document.getElementById("flashlight-control");

  // --- A-Frame Components (animal-handler, scene-controller) ---
  // These remain IDENTICAL to your previous working version.
  // Ensure they are here. I'll put placeholders for brevity.

  AFRAME.registerComponent("animal-handler", {
    schema: {
      animalName: { type: "string", default: "Animal" },
      audioId: { type: "string" },
    },
    init: function () {
      this.isMarkerCurrentlyVisible = false;
    },
    tick: function () {
      this.isMarkerCurrentlyVisible = !!(
        this.el.object3D && this.el.object3D.visible
      );
    },
  });

  let currentPlayingAudioElement = null;

  AFRAME.registerComponent("scene-controller", {
    init: function () {
      console.log("Scene Controller Initialized.");
      this.markerHandlers = [];
      this.uiAudioControl = document.getElementById("audio-control");
      this.uiScanningIndicator = document.getElementById("scanning-indicator");
      this.uiSuccessMessage = document.getElementById("success-message");
      this.uiSuccessText = document.getElementById("success-text");
      this.currentlyActiveAnimalName = null;
      this.currentlyActiveAudioId = null;

      this.el.sceneEl.addEventListener("loaded", () => {
        const markerElements = Array.from(
          this.el.sceneEl.querySelectorAll("a-marker[animal-handler]")
        );
        this.markerHandlers = markerElements
          .map((mEl) => {
            return mEl.components["animal-handler"]
              ? mEl.components["animal-handler"]
              : null;
          })
          .filter((handler) => handler !== null);
        console.log(
          "Scene Controller: Found marker handlers:",
          this.markerHandlers.map((h) => h.data.animalName)
        );
      });

      this.uiAudioControl.addEventListener("click", () => {
        if (this.currentlyActiveAudioId) {
          const audioEl = document.getElementById(this.currentlyActiveAudioId);
          if (audioEl) {
            audioEl.currentTime = 0;
            audioEl
              .play()
              .catch((error) => console.error("Error playing sound:", error));
          }
        }
      });
    },

    tick: function () {
      if (this.markerHandlers.length === 0 && this.el.sceneEl.hasLoaded) {
        const markerElements = Array.from(
          this.el.sceneEl.querySelectorAll("a-marker[animal-handler]")
        );
        this.markerHandlers = markerElements
          .map((mEl) => mEl.components["animal-handler"])
          .filter((h) => h);
      }

      let visibleAnimalHandler = null;
      if (this.currentlyActiveAnimalName) {
        const lastActiveHandler = this.markerHandlers.find(
          (h) => h.data.animalName === this.currentlyActiveAnimalName
        );
        if (lastActiveHandler && lastActiveHandler.isMarkerCurrentlyVisible) {
          visibleAnimalHandler = lastActiveHandler;
        }
      }
      if (!visibleAnimalHandler) {
        for (const handler of this.markerHandlers) {
          if (handler.isMarkerCurrentlyVisible) {
            visibleAnimalHandler = handler;
            break;
          }
        }
      }

      if (visibleAnimalHandler) {
        const newAnimalName = visibleAnimalHandler.data.animalName;
        const newAudioId = visibleAnimalHandler.data.audioId;

        if (this.currentlyActiveAnimalName !== newAnimalName) {
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
        if (this.currentlyActiveAnimalName !== null) {
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

  // --- Flashlight Logic ---
  async function toggleFlashlight() {
    if (!videoTrack) {
      console.warn("Video track not available for flashlight.");
      // Attempt to get it again if AR started but track wasn't ready
      const videoEl = document.querySelector("video"); // AR.js might use #arjs-video or just video
      if (videoEl && videoEl.srcObject) {
        const stream = videoEl.srcObject;
        if (stream) {
          const tracks = stream.getVideoTracks();
          if (tracks.length > 0) videoTrack = tracks[0];
        }
      }
      if (!videoTrack) return; // Still not found
    }

    try {
      const capabilities = videoTrack.getCapabilities();
      if (!capabilities.torch) {
        console.warn("Device does not support torch/flashlight control.");
        flashlightControlButton.style.display = "none"; // Hide button if not supported
        return;
      }

      await videoTrack.applyConstraints({
        advanced: [{ torch: !isFlashlightOn }],
      });
      isFlashlightOn = !isFlashlightOn;
      flashlightControlButton.classList.toggle("active", isFlashlightOn);
      console.log("Flashlight " + (isFlashlightOn ? "ON" : "OFF"));
    } catch (err) {
      console.error("Error toggling flashlight:", err);
      // If it failed, try to hide button as it might not be usable
      // flashlightControlButton.style.display = 'none';
    }
  }

  function initializeFlashlightButton() {
    if (flashlightControlButton) {
      // Check for initial support once videoTrack is available
      if (
        videoTrack &&
        videoTrack.getCapabilities &&
        videoTrack.getCapabilities().torch
      ) {
        flashlightControlButton.style.display = "flex"; // Show button
        flashlightControlButton.addEventListener("click", toggleFlashlight);
      } else if (videoTrack) {
        // videoTrack exists but no torch support
        console.warn("Flashlight not supported by this device/camera.");
        flashlightControlButton.style.display = "none";
      } else {
        // videoTrack not ready yet, button remains hidden.
        // The loader logic will try to show it again when track is found.
        flashlightControlButton.style.display = "none";
      }
    }
  }

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

        console.log(
          "[PASSCODE_FLOW] AR Scene setup. scene-controller will manage AR UI."
        );

        const arReadyTimeout = 15000; // Max wait for AR before hiding loader (increased slightly)
        const checkARReadyInterval = 500;
        let timeWaited = 0;

        const arReadyCheck = setInterval(() => {
          timeWaited += checkARReadyInterval;
          // AR.js usually creates a video element. It might have id="arjs-video" or just be the only video.
          const videoEl =
            document.querySelector("#arjs-video") ||
            document.querySelector("video");

          let videoReady = false;
          if (videoEl && videoEl.srcObject && videoEl.readyState >= 2) {
            // HAVE_CURRENT_DATA
            videoReady = true;
            if (!videoTrack) {
              // Try to get videoTrack if not already set
              const stream = videoEl.srcObject;
              if (stream) {
                const tracks = stream.getVideoTracks();
                if (tracks.length > 0) {
                  videoTrack = tracks[0];
                  console.log("Video track obtained for flashlight.");
                  initializeFlashlightButton(); // Attempt to show flashlight button now
                }
              }
            }
          }

          if (
            (arSceneEl.hasLoaded && videoReady) ||
            timeWaited >= arReadyTimeout
          ) {
            clearInterval(arReadyCheck);
            console.log(
              `%c[SYSTEM_READY] AR system ready (hasLoaded: ${arSceneEl.hasLoaded}, videoReady: ${videoReady}). Hiding loader.`,
              "color: green;"
            );
            loader.classList.add("hidden");
            setTimeout(() => (loader.style.display = "none"), 500);
            if (
              timeWaited >= arReadyTimeout &&
              !(arSceneEl.hasLoaded && videoReady)
            ) {
              console.warn(
                "[LOADER] Loader hidden due to timeout. AR system might not be fully initialized."
              );
            }
            // Final attempt to initialize flashlight button if track was found late
            if (
              videoTrack &&
              flashlightControlButton.style.display === "none"
            ) {
              initializeFlashlightButton();
            }
          } else {
            console.log(
              `[LOADER] Waiting for AR... (hasLoaded: ${
                arSceneEl.hasLoaded
              }, videoEl: ${!!videoEl}, videoReadyState: ${
                videoEl ? videoEl.readyState : "N/A"
              })`
            );
          }
        }, checkARReadyInterval);
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
        /* Silently ignore */
      }
    }
  }

  // Initialize flashlight button (it will be hidden until video track is ready)
  initializeFlashlightButton(); // Initial call, might hide it if track not ready.

  console.log("Initial script setup complete.");
});
