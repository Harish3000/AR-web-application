// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // --- Elements ---
  const landingPage = document.getElementById("landing-page");
  const passcode_input = document.getElementById("passcode-input");
  const enterButton = document.getElementById("enter-button");
  const errorMessage = document.getElementById("error-message");
  const loader = document.getElementById("loader");
  const arContainer = document.getElementById("ar-container");

  // --- Config ---
  // List of valid animal names (lowercase)
  const validAnimals = ["bird", "dino"]; // UPDATED animal names

  // --- Event Listener ---
  enterButton.addEventListener("click", () => {
    const enteredPasscode = passcode_input.value.trim().toLowerCase();

    // Clear previous error
    errorMessage.textContent = "";

    // Check if the entered passcode is a valid animal name
    if (validAnimals.includes(enteredPasscode)) {
      console.log("Access Granted for:", enteredPasscode);
      // 1. Hide Landing Page with fade out
      landingPage.classList.add("hidden");

      // 2. Show Loader
      loader.style.display = "flex"; // Show loader
      loader.classList.remove("hidden"); // Ensure opacity is 1

      // 3. Prepare and show AR content
      setTimeout(() => {
        arContainer.style.display = "block"; // A-Frame scene starts loading

        // A-Frame/AR.js will attempt to initialize camera
        // On HTTPS, it will ask for permission if not already granted.

        // Hide loader after a delay.
        setTimeout(() => {
          loader.classList.add("hidden");
          setTimeout(() => {
            loader.style.display = "none";
          }, 500); // Match CSS transition time
        }, 3000); // Increased loading time slightly, adjust if models are large
      }, 500); // Wait for landing page fade-out
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
      enterButton.click();
    }
  });

  // Ensure shake animation CSS is present
  if (
    !document.styleSheets[0].cssRules.length ||
    ![...document.styleSheets[0].cssRules].some((rule) => rule.name === "shake")
  ) {
    const styleSheet = document.styleSheets[0];
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
  }
}); // End DOMContentLoaded
