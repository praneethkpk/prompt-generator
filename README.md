# ⚡ AI Prompt Generator — Client-Side BYOK Prompt Engineering Workspace

A privacy-first, **Bring Your Own Key (BYOK)** prompt engineering workspace built with **React**, **Vite**, **Tailwind CSS**, and a **Multi-Provider Adapter Engine**.

The application enables users to create, evaluate, benchmark, and manage engineered prompts across multiple LLM providers (Google Gemini, OpenAI, Groq, OpenRouter, DeepSeek, Mistral, and local Ollama) directly from the browser.

---

## 🔒 Security & Privacy Architecture

This application operates as a **Pure Client-Side BYOK Static Application** with **Zero Server Persistence**:

- **In-Memory Key Handling:** API keys live exclusively in temporary **In-Memory Application State** (`apiKey`). Keys are **never written to `localStorage`**, cookies, or disk, and vanish when the browser tab closes.
- **Direct Provider Fetch:** Outbound API requests travel directly from the client browser to your selected AI provider. No intermediate backend proxy or logging server is involved.
- **No App-Level Telemetry:** The application contains zero user tracking, analytics scripts, or server logging layer.
- **Local Prompt History Privacy:** Prompt history persists strictly in client browser `localStorage` for convenience and can be cleared manually at any time.
- **Non-Sensitive Preference Persistence:** Only non-sensitive configurations (`provider`, `model`, `baseURL`) persist in `localStorage`.
- **Custom Base URL Protocol Guard:** Custom endpoints are validated for protocol safety (`https://` required for remote hosts; `http://` permitted for local Ollama/localhost). Custom URLs require explicit user confirmation.
- **Static Content Security Policy (CSP):** Netlify deployment headers enforce static CSP restrictions, scoping `connect-src` rules to verified provider API domains.

---

## ✨ Features

- 🎯 **Meta-Prompt Engineering Engine:** Transforms structured inputs (*Role*, *Context*, *Task*, *Desired Output Format*) into production-grade prompts using XML tags and Chain-of-Thought (CoT) directives.
- 🔌 **Multi-Provider Adapter Engine:** Pre-configured adapters for:
  - **Google Gemini** (`gemini-3.6-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-pro`, `gemini-2.5-flash`)
  - **OpenAI** (`gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`, `o3-mini`)
  - **Groq Ultra-Fast** (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`)
  - **OpenRouter** (`anthropic/claude-3.5-sonnet`, `google/gemini-2.5-flash`, etc.)
  - **DeepSeek AI** (`deepseek-chat`, `deepseek-reasoner`)
  - **Mistral AI** (`mistral-small-latest`, `mistral-large-latest`)
  - **Local Ollama** (`llama3.2`, `qwen2.5-coder`)
  - **Custom OpenAI-Compatible Providers**
- 🧪 **Connection Verification:** Test endpoint status and latency (`✓ Connection Successful (350ms)`) directly in Settings.
- 📊 **5-Metric Prompt Quality Evaluator:** Scores engineered prompts on *Clarity*, *Specificity*, *Context & Persona*, *Constraints*, and *Output Format* (0–10) with actionable optimization recommendations.
- ⚖️ **Multi-Model Comparison Engine:** Benchmark prompt execution side-by-side across up to 3 selected models simultaneously.
- 📚 **Prompt Templates Library:** Pre-engineered templates across 8 categories (Software Engineering, System Design, Coding, Debugging, Testing, Business, Research, Resume).
- 📜 **Local Prompt History & Exports:** History manager with search, favorites, JSON backup/import, and Markdown/TXT exports.
- 🧪 **Automated Unit Test Suite:** Vitest test suite testing URL validation, metric calculations, and prompt generators (`npm test`).
- ⌨️ **Keyboard Shortcuts:** `Ctrl+Enter` to generate, `Ctrl+Shift+T` for templates, `Ctrl+Shift+H` for history, `Ctrl+Shift+S` for settings.

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/praneethkpk/prompt-generator.git
cd prompt-generator
npm install
```

### 2. Run Automated Unit Tests

```bash
npm test
```

### 3. Start Development Server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### 4. Enter API Key in Settings

Click **⚙️ Settings** in the top navigation bar, select your provider (e.g. Google Gemini, OpenAI, or Groq), enter your API key, and click **💾 Activate Settings**.

---

## 🛠️ Provider Endpoint Reference

| Provider | Base URL | Default Model | Key Requirement |
| :--- | :--- | :--- | :--- |
| **Google Gemini** | `https://generativelanguage.googleapis.com/v1beta/openai` | `gemini-3.6-flash` | Free Tier Available |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4o-mini` | Pay-as-you-go |
| **Groq** | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | Free Tier Available |
| **OpenRouter** | `https://openrouter.ai/api/v1` | `google/gemini-2.5-flash` | Pay-as-you-go |
| **DeepSeek AI** | `https://api.deepseek.com/v1` | `deepseek-chat` | Pay-as-you-go |
| **Mistral AI** | `https://api.mistral.ai/v1` | `mistral-small-latest` | Pay-as-you-go |
| **Local Ollama** | `http://localhost:11434/v1` | `llama3.2` | Free (Local) |

---

## 🌐 Netlify Production Deployment

Because this project is a static React application, deploying to Netlify takes less than a minute:

1. Push your repository to GitHub.
2. Connect your repository in [Netlify Console](https://app.netlify.com).
3. Build Settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Netlify will automatically detect `netlify.toml` and apply security headers (`_headers`).

---

## 📁 Project Structure

```
prompt-generator/
├── public/
│   └── _headers                      # Netlify static CSP & security headers
├── src/
│   ├── main.jsx                      # React entry point
│   ├── App.jsx                       # Main application shell & state
│   ├── index.css                     # Tailwind CSS & theme variables
│   ├── components/
│   │   ├── PromptForm.jsx            # Inputs with live character counters
│   │   ├── PromptOutput.jsx          # Markdown renderer & export triggers
│   │   ├── PromptEvaluator.jsx       # 5-Metric quality scorecard
│   │   ├── ModelComparisonModal.jsx  # Side-by-side benchmark runner
│   │   ├── SettingsModal.jsx         # Provider config & Test Connection
│   │   ├── SecurityPrivacyModal.jsx  # Architecture & privacy guarantees
│   │   ├── PromptTemplatesModal.jsx  # Template gallery loader
│   │   ├── PromptHistoryModal.jsx    # History manager & JSON/MD exporter
│   │   └── ui/                       # shadcn UI components (button, card, input, textarea)
│   ├── data/
│   │   └── promptTemplates.js        # Curated template dataset
│   ├── hooks/
│   │   └── useKeyboardShortcuts.js   # Global hotkey listener
│   ├── prompts/
│   │   └── metaPromptTemplate.js     # Structural meta-prompt builder
│   └── services/
│       ├── llmService.js             # Session key & LLM orchestration
│       ├── evaluatorService.js       # Metric scoring engine
│       ├── historyService.js         # LocalStorage history & export utils
│       ├── __tests__/                # Evaluator unit test suite
│       └── adapters/
│           ├── index.js              # Provider adapters with timeouts
│           └── __tests__/            # Adapters & URL validation unit tests
├── netlify.toml                      # Netlify deployment configuration
├── package.json                      # Dependencies & build scripts
└── vite.config.js                    # Vite bundler configuration
```
