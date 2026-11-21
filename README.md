# Okkhoro — Bangla Typing Practice

![Okkhoro app icon](assets/icon.svg)

**Author:** Eshtiyaq Hossain

**Project type:** Desktop typing-practice application

**Technologies:** Electron, HTML, CSS, JavaScript

---

## 1. Abstract

Okkhoro is a desktop application for practicing Bangla and English typing. It provides timed exercises and tracks typing speed, accuracy, errors, and progress. The application is built with web technologies and packaged for desktop using Electron.

## 2. Introduction

Typing comfortably in more than one language takes regular practice. Okkhoro offers a focused place to practice Bangla or English, choose an exercise style and session length, and see performance while typing.

## 3. Methodology

The application uses a lightweight Electron architecture:

- **Desktop runtime:** Electron creates the application window and loads the local interface.
- **Frontend:** HTML provides the interface, CSS styles it, and JavaScript manages practice sessions and score updates.
- **Local data:** Best performance scores are saved in the application's browser storage.

### 3.1 System Architecture

- `main.js` creates and manages the Electron window.
- `preload.js` exposes the desktop platform information to the interface through a restricted context bridge.
- `index.html`, `style.css`, and `renderer.js` implement the user interface and typing exercises.

## 4. Results and Features

Okkhoro includes:

- Bangla and English practice
- Sentence practice and five-letter practice
- 30-second, 1-minute, and 2-minute sessions
- Live typing speed, accuracy, timer, error, and progress indicators
- Best score tracking

### 4.1 Interface and User Experience

The interface is designed to keep the practice text, typing area, and session statistics easy to follow. The `screenshots` folder is ready for application screenshots; screenshots have not yet been added.

## 5. Discussion

Because Okkhoro runs as a desktop app, it can open its interface directly without a separate web server. The current version focuses on the core typing-practice experience and includes a small set of built-in practice passages.

## 6. Conclusion

Okkhoro brings timed Bangla and English typing exercises into a simple desktop application. Users can choose how and for how long to practice, then review their performance as they go.

## 7. How to Run

### Requirements

- Node.js 22 or later
- npm

### Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/eshtiyaqhossain/Bangla-typing-master.git
   cd Bangla-typing-master
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the desktop app:

   ```bash
   npm start
   ```

### Build installers locally

```bash
npm run build:win
npm run build:mac
npm run build:linux
```

Run the matching build command on its target operating system. Output is created in the `dist` folder.

### Build and publish for all platforms

Push a version tag (for example, `v1.0.3`) to run the GitHub Actions workflow. It builds Windows installers (`.exe`), macOS installers (`.dmg`), and Linux packages (`.deb` and `.AppImage`) and publishes them to a GitHub release.

---

*Okkhoro — একটু একটু করে, আরও দ্রুত।*
