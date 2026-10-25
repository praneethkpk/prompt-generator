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

### 3. Start Frontend Development Server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### 4. Optional: Start Spring Boot Backend (For Secure Encrypted Key Vault & Cloud Sync)

PromptGen can run as a **100% client-side app** with zero backend.
If you also want centralized JWT user authentication, persistent cloud history, and an **AES-256-GCM encrypted key vault**, start the backend:

```bash
npm run backend
# Or: cd backend && mvn spring-boot:run
```

- Backend API: **http://localhost:8080/api/v1**
- Swagger UI / OpenAPI docs: **http://localhost:8080/swagger-ui.html**
- H2 Dev Console: **http://localhost:8080/h2-console**

### 5. Enter API Key in Settings

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

## 🌐 Production Deployment

- **Frontend (Netlify / Vercel):** Pure static build via `npm run build` targeting `dist/`.
- **Backend (Docker / Cloud / VPS):** Containerized Spring Boot 3.2 app via `backend/Dockerfile` and `docker-compose.yml` with PostgreSQL and AES-256 key encryption.

---

## 📁 Project Structure

```
prompt-generator/
├── backend/                          # Spring Boot 3.2 Java 21 Backend
│   ├── pom.xml                       # Maven build descriptor (Java 21)
│   ├── Dockerfile & docker-compose   # Containerization for PostgreSQL + Spring Boot
│   └── src/main/java/com/promptgen/
│       ├── config/                   # SecurityConfig, CorsConfig, JwtConfig, OpenApiConfig
│       ├── controller/               # Auth, ApiKey, Prompt, Health REST endpoints
│       ├── security/                 # JwtTokenProvider, JwtAuthenticationFilter
│       ├── service/                  # EncryptionService (AES-256-GCM), AuthService, PromptService
│       └── model/                    # User, ApiKey (encrypted), PromptHistory entities
├── public/                           # Static assets and Netlify headers
├── src/
│   ├── main.jsx                      # React entry point
│   ├── App.jsx                       # Main shell wrapped in ErrorBoundary + Toaster
│   ├── router.jsx                    # React Router routes (Generator, Dashboard, Library, etc.)
│   ├── store/                        # Zustand stores (auth, settings, history, theme)
│   ├── pages/                        # Generator, Dashboard, Library, ApiKeys, Login, Register
│   ├── components/                   # PromptForm, PromptOutput, Modals, ErrorBoundary, ui/
│   ├── prompts/                      # metaPromptTemplate.js (XML CoT prompt builder)
│   └── services/                     # llmService, adapters, historyService, backend API client
├── package.json                      # Frontend scripts + npm run backend
└── vite.config.js                    # Vite bundler with proxy to port 8080
```

