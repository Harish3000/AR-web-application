document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed. Using MindAR setup.");

  const landingPage = document.getElementById("landing-page");
  const passcode_input = document.getElementById("passcode-input");
  const enterButton = document.getElementById("enter-button");
  const errorMessage = document.getElementById("error-message");
  const loader = document.getElementById("loader"); // Main app loader
  const arContainer = document.getElementById("ar-container");
  const scanningUI = document.getElementById("scanningUI"); // MindAR specific UI

  let arSceneEl = null;
  let mindARSystem = null; // To hold the MindAR system instance

  const validAnimals = ["bird", "dino"];
  console.log("Valid animals:", validAnimals);

  // Store references to models
  const modelDino = document.getElementById("model-dino");
  const modelBird = document.getElementById("model-bird");

  function setupModelListeners() {
    console.log("[MINDAR_SCRIPT] Setting up model load/error listeners.");
    if (modelDino) {
      modelDino.addEventListener("model-loaded", () =>
        console.log("%c[MODEL_EVENT] Dino model loaded.", "color: green;")
      );
      modelDino.addEventListener("model-error", (e) =>
        console.error("%c[MODEL_EVENT] Dino model error:", "color: red;", e)
      );
    }
    if (modelBird) {
      modelBird.addEventListener("model-loaded", () =>
        console.log("%c[MODEL_EVENT] Bird model loaded.", "color: green;")
      );
      modelBird.addEventListener("model-error", (e) =>
        console.error("%c[MODEL_EVENT] Bird model error:", "color: red;", e)
      );
    }
  }
  setupModelListeners(); // Call it once at the start

  enterButton.addEventListener("click", () => {
    console.log("[PASSCODE_FLOW] Enter AR button clicked.");
    const enteredPasscode = passcode_input.value.trim().toLowerCase();

    if (validAnimals.includes(enteredPasscode)) {
      console.log("[PASSCODE_FLOW] Access Granted for:", enteredPasscode);
      landingPage.classList.add("hidden");
      loader.style.display = "flex"; // Show general loader
      loader.classList.remove("hidden");

      setTimeout(() => {
        arContainer.style.display = "block";
        console.log("[PASSCODE_FLOW] AR container display set to block.");

        arSceneEl = document.querySelector("a-scene"); // More robust selector
        if (!arSceneEl) {
          console.error("[PASSCODE_FLOW_ERROR] AR Scene element not found!");
          loader.classList.add("hidden");
          setTimeout(() => (loader.style.display = "none"), 500);
          return;
        }

        mindARSystem = arSceneEl.systems["mindar-image-system"];

        if (!mindARSystem) {
          console.error(
            "[MINDAR_ERROR] MindAR Image System not found on a-scene! Check mindar-image attribute."
          );
          // Add listener for A-Frame scene loaded, then check again
          arSceneEl.addEventListener(
            "loaded",
            () => {
              console.log(
                "[MINDAR_INFO] A-Frame scene loaded, re-checking for MindAR system."
              );
              mindARSystem = arSceneEl.systems["mindar-image-system"];
              if (mindARSystem) {
                console.log(
                  "[MINDAR_INFO] MindAR Image System found after scene load."
                );
                startAR();
              } else {
                console.error(
                  "[MINDAR_ERROR] MindAR Image System STILL not found after scene load!"
                );
                loader.classList.add("hidden");
                setTimeout(() => (loader.style.display = "none"), 500);
              }
            },
            { once: true }
          );
          return;
        }

        startAR(); // If system found immediately
      }, 500);
    } else {
      errorMessage.textContent = 'Invalid animal name. Try "bird" or "dino".';
      passcode_input.style.animation = "shake 0.5s ease";
      setTimeout(() => (passcode_input.style.animation = ""), 500);
    }
  });

  function startAR() {
    console.log("[MINDAR_SCRIPT] Attempting to start MindAR system.");
    if (!mindARSystem || !mindARSystem.start) {
      console.error(
        "[MINDAR_ERROR] MindAR system or its start method is not available."
      );
      loader.classList.add("hidden");
      setTimeout(() => (loader.style.display = "none"), 500);
      return;
    }

    // Hide general loader, MindAR might show its own (uiLoading)
    loader.classList.add("hidden");
    setTimeout(() => (loader.style.display = "none"), 500);

    // Add event listeners for MindAR target events
    // targetFound / targetLost are for specific targets if needed.
    // arReady / arError are for the overall system.
    arSceneEl.addEventListener("arReady", (event) => {
      console.log(
        "%c[MINDAR_EVENT] MindAR System Ready.",
        "color: purple; font-weight: bold;"
      );
      if (scanningUI) scanningUI.style.display = "flex"; // Show scanning UI
    });
    arSceneEl.addEventListener("arError", (event) => {
      console.error(
        "%c[MINDAR_EVENT] MindAR System Error.",
        "color: red; font-weight: bold;",
        event.detail
      );
    });

    // Get target entities
    const dinoTarget = document.getElementById("target-dino");
    const birdTarget = document.getElementById("target-bird");

    if (dinoTarget) {
      dinoTarget.addEventListener("mindar-targetfound", (event) => {
        console.log(
          "%c[MINDAR_TARGET] Dino Target Found",
          "color: blue; font-weight: bold;"
        );
        if (modelDino) modelDino.setAttribute("visible", "true");
        if (scanningUI) scanningUI.style.display = "none";
      });
      dinoTarget.addEventListener("mindar-targetlost", (event) => {
        console.log("%c[MINDAR_TARGET] Dino Target Lost", "color: orange;");
        if (modelDino) modelDino.setAttribute("visible", "false");
        if (scanningUI) scanningUI.style.display = "flex";
      });
    } else {
      console.error("Dino target entity not found");
    }

    if (birdTarget) {
      birdTarget.addEventListener("mindar-targetfound", (event) => {
        console.log(
          "%c[MINDAR_TARGET] Bird Target Found",
          "color: blue; font-weight: bold;"
        );
        if (modelBird) modelBird.setAttribute("visible", "true");
        if (scanningUI) scanningUI.style.display = "none";
      });
      birdTarget.addEventListener("mindar-targetlost", (event) => {
        console.log("%c[MINDAR_TARGET] Bird Target Lost", "color: orange;");
        if (modelBird) modelBird.setAttribute("visible", "false");
        if (scanningUI) scanningUI.style.display = "flex";
      });
    } else {
      console.error("Bird target entity not found");
    }

    // Start the MindAR engine
    // This should happen after listeners are set up
    // The `autoStart: false` in HTML means we need to call start() manually.
    mindARSystem.start();
    console.log("[MINDAR_SCRIPT] Called mindARSystem.start()");
  }

  passcode_input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") enterButton.click();
  });

  if (document.styleSheets.length > 0 && document.styleSheets[0].cssRules) {
    if (
      ![...document.styleSheets[0].cssRules].some(
        (rule) => "name" in rule && rule.name === "shake"
      )
    ) {
      try {
        document.styleSheets[0].insertRule(
          `@keyframes shake {0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); }}`,
          document.styleSheets[0].cssRules.length
        );
        console.log("Shake animation CSS rule inserted.");
      } catch (e) {
        console.warn("Could not insert shake animation rule:", e);
      }
    }
  } else {
    console.warn("Stylesheet not available for shake animation.");
  }

  console.log("Initial script setup complete.");
});
