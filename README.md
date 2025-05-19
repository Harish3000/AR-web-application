# 🎯 AR Web Application — Marker-Based Augmented Reality Experience

## 🚀 Introduction

This project, **"AR Web Application,"** offers a simple yet engaging **Augmented Reality (AR)** experience directly in your **web browser** 🌐. By leveraging modern web technologies, users can point their device's camera at specially designed **markers**, which bring **3D models** to life in their real-world environment 🧠✨.

Key interactive features include:

-   🔐 Password-protected access
    
-   🔊 Audio feedback tied to each object
    
-   🕹️ Manual control of scanning via a "Start Scan" button
    

This serves as a fantastic educational, entertainment, or promotional demo of **WebAR**.

----------

## 🔗 Deployed Website

🌍 Try it live here:  
👉 **[https://harish3000.github.io/AR-web-application/](https://harish3000.github.io/AR-web-application/)**

> ⚠️ Use a mobile device or a laptop with a webcam and allow camera permissions when prompted.  
> This must be accessed via **HTTPS** to work properly (camera access requirement).

----------

## 🧰 Libraries Used

-   **A-Frame**  
    A web framework for building VR and AR experiences using HTML-like tags. It simplifies creating 3D and WebXR scenes.  
    🔗 [https://aframe.io/](https://aframe.io/)
    
-   **AR.js**  
    An efficient, open-source WebAR library for marker-based AR. Integrates seamlessly with A-Frame to enable **marker detection and tracking**.  
    🔗 [https://github.com/AR-js-org/AR.js/](https://github.com/AR-js-org/AR.js/)
    

----------

## ✨ Features

-   🔐 **Password-protected entry** to the AR experience
    
-   ⏳ **Loading screen** while initializing AR
    
-   🔍 Detects **multiple unique pattern markers**
    
-   🧊 Displays **corresponding 3D models** when markers are detected
    
-   👀 Shows **visual feedback** (`"Scanning..."` / `"Object Detected"`)
    
-   🔊 Displays an **audio icon** when an object is visible
    
-   🖱️ Clicking the icon **plays a sound** associated with the object
    
-   🔇 Hides sound and icon when the marker is not visible
    
-   🟢 **"Start Scan" button** to initiate marker detection
    
----------
## 🛠️ Setup and Running Locally

### 1. 🔄 Clone the Repository

```bash
git clone https://github.com/Harish3000/AR-web-application.git
cd AR-web-application

```

### 2. 🧩 Prepare Assets

Ensure the following:

-   Your **3D models** (`*.glb`) are in `assets/`
    
-   Your **audio files** (`*.mp3`) are in `assets/audio/`
    
-   Your **marker patterns** (`*.patt`) are in `markers/`
    

📌 **Update file paths** in `index.html` and `script.js` if needed.

----------

### 3. 🧪 Run with a Live Server (**HTTPS Required**)

Modern browsers **require HTTPS** for camera access.

#### Using VS Code Live Server with HTTPS:

1.  Install **Live Server** extension by Ritwick Dey.
    
2.  Open the project folder in VS Code.
    
3.  Go to **Settings** (`Ctrl+,`) and search:
    
    ```
    liveServer.settings.https
    
    ```
    
4.  Click **"Edit in settings.json"** and add:
    

```json
"liveServer.settings.https": {
  "enable": true,
  "key": "",   // Optional: Path to SSL key
  "cert": ""   // Optional: Path to SSL cert
}

```

Leaving `key` and `cert` empty will generate **self-signed certificates**.

5.  Right-click `index.html` → **"Open with Live Server"**
    
6.  Accept the browser’s **self-signed certificate warning** to proceed.
    

----------

### 4. 🌐 Access the AR Experience

-   Open the **HTTPS** URL from Live Server in a mobile device or PC with a webcam
    
-   ✅ Allow camera permissions
    
-   🔐 Enter password (`Harish` by default — set in `script.js`)
    
-   🟢 Click **"Start Scan"**
    
-   🖼️ Point the camera at a printed AR marker
    

----------

## 🧾 Marker Generation

You can generate your own `.patt` marker files using the official **AR.js Marker Training Tool**:

🔗 [Marker Generator Tool](https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html)

📝 Steps:

1.  Upload a clear, square image (e.g., 512×512 PNG)
    
2.  Download the `.patt` marker
    
3.  Place it in the `markers/` folder
    

----------

