# ✨ Web Highlighter

**High-performance, privacy-focused text highlighting for the modern web.**

Built with **React 18**, **Vite**, and **CRXJS**, this Chrome extension allows you to highlight text on any webpage and save it locally. Never lose a great quote or important information again.

![Web Highlighter Architecture](https://mermaid.ink/svg/pako:eNptkEELwjAMhf9KyGl_gB71IGTgwYPebGshW-u6re4mIuK_m10EFT2F970vL8mBqlYCBf_I6-pBaY0TqKWyH8WESayfW6KWRU_TjH32u9WGLXInzDHzI7DHDm3p3CkzF679q06XOfB_Y6-vC3Xq0AnN_T-m1S26UfN067p00yV2_AnT5rZfXekyN_zYI7CnuE63_OqWnmv_LuzUeS-02InL-YqdrXW6-R-X5idp)

## 🚀 Features

-   **Seamless Highlighting**: Select any text and click the floating 💾 button to save.
-   **XPath Persistence**: Highlights remain exactly where you left them, even after page reloads.
-   **Premium UI**: A sleek, dark-themed popup to manage your collection.
-   **AI Summarization**: Transform your highlights into cohesive summaries using OpenAI.
-   **Privacy First**: All data is stored in your browser's local storage. Your API keys never leave your device.
-   **Shadow DOM Isolation**: Zero styles leakage from the extension to the website you're visiting.

## 🛠️ Tech Stack

-   **Frontend**: React 18, Vanilla CSS (Glassmorphism)
-   **Build Tool**: Vite 5 + CRXJS (Manifest V3)
-   **Storage**: Chrome Storage API
-   **AI**: OpenAI API Integration

## 📦 Installation

### Prerequisites
-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [Google Chrome](https://www.google.com/chrome/) or a Chromium-based browser

### Steps
1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd chrome-web-highlighter
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Build the project**:
    ```bash
    npm run build
    ```
4.  **Load in Chrome**:
    -   Open Chrome and go to `chrome://extensions`.
    -   Enable **Developer mode** (top right).
    -   Click **Load unpacked**.
    -   Select the **`dist`** folder in this project directory.

## 🏃 Development

To start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Changes to the popup or content scripts will be reflected instantly in the browser!

## 🤖 AI Summary Setup

To use the AI Summarize feature:
1.  Click the extension icon in your toolbar.
2.  Click the **⚙️ Settings** icon in the header.
3.  Paste your **OpenAI API Key**.
4.  Go to the **AI Summary** tab and click **Summarize All Highlights**.

## 📄 License

MIT
