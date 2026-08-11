# ⚡ AI Prompt Generator — Provider-Agnostic Meta-Prompting Web App

A lightweight, production-ready Prompt Generator application built with **React**, **Tailwind CSS**, **shadcn UI**, and a secure **Node.js Express Proxy**.

The application converts structured user inputs (*Role*, *Context*, *Task*, *Desired Output Format*) into engineered, production-grade prompts using XML-tag meta-prompting and Chain-of-Thought (CoT) directives.

---

## 🔒 Security Architecture (Zero Client Secrets)

This app implements a **Zero-Client-Key Proxy Pattern**:
- **No API Keys in Client Bundles**: API keys are stored in server-only environment variables (`LLM_API_KEY`) without the `VITE_` prefix.
- **Backend Proxy (`server/index.js`)**: Handles authentication, prompt-length validation (max 10,000 chars), rate-limiting (15 req/min per IP), and error sanitisation.
- **Vite Proxy (`vite.config.js`)**: Routes frontend requests (`/api/*`) seamlessly to the backend server (`http://localhost:3001`).

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
cd prompt-generator-app
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` to add your provider credentials (see configurations below).

### 3. Start Application

Run both backend proxy and frontend concurrently:

```bash
npm run dev:all
```

Or run separately in two terminals:

```bash
# Terminal 1 (Backend Proxy)
npm run server

# Terminal 2 (Vite Frontend)
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔌 Provider Configuration Guide

Because the backend proxy uses the standard **OpenAI-Compatible Chat Completions API format**, you can switch between any cloud or local LLM provider simply by setting `LLM_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL` in your `.env` file.

### 1. OpenAI

- **Get API Key**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

```env
LLM_API_KEY=sk-proj-your-openai-key-here
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
PORT=3001
```

*Popular OpenAI Models:* `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`

---

### 2. Google Gemini (OpenAI-Compatible Endpoint)

- **Get API Key**: [https://aistudio.google.com/](https://aistudio.google.com/)

```env
LLM_API_KEY=your-gemini-api-key-here
LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
LLM_MODEL=gemini-3.5-flash
PORT=3001
```

*Popular Gemini Models:* `gemini-3.5-flash`, `gemini-3.6-flash`, `gemini-1.5-pro`

---

### 3. Groq (Ultra-Fast Inference)

- **Get API Key**: [https://console.groq.com/keys](https://console.groq.com/keys)

```env
LLM_API_KEY=gsk_your_groq_api_key_here
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.3-70b-versatile
PORT=3001
```

*Popular Groq Models:* `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`

---

### 4. DeepSeek AI

- **Get API Key**: [https://platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys)

```env
LLM_API_KEY=sk-your-deepseek-key-here
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
PORT=3001
```

*Popular DeepSeek Models:* `deepseek-chat` (DeepSeek-V3), `deepseek-reasoner` (DeepSeek-R1)

---

### 5. Local Ollama (Zero Cost & Offline)

- **Download Ollama**: [https://ollama.com/](https://ollama.com/)
- **Pull Model**: Run `ollama pull llama3` or `ollama pull qwen2.5-coder`

```env
LLM_API_KEY=ollama
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=llama3
PORT=3001
```

*Popular Ollama Models:* `llama3`, `qwen2.5-coder`, `mistral`, `gemma2`

---

### 6. OpenRouter (Access 100+ Models)

- **Get API Key**: [https://openrouter.ai/keys](https://openrouter.ai/keys)

```env
LLM_API_KEY=sk-or-v1-your-openrouter-key-here
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=anthropic/claude-3.5-sonnet
PORT=3001
```

*Popular OpenRouter Models:* `anthropic/claude-3.5-sonnet`, `meta-llama/llama-3.3-70b-instruct`, `mistralai/mistral-large`

---

### 7. Together AI

- **Get API Key**: [https://api.together.ai/settings/api-keys](https://api.together.ai/settings/api-keys)

```env
LLM_API_KEY=your-together-api-key-here
LLM_BASE_URL=https://api.together.xyz/v1
LLM_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo
PORT=3001
```

---

### 8. Mistral AI

- **Get API Key**: [https://console.mistral.ai/api-keys/](https://console.mistral.ai/api-keys/)

```env
LLM_API_KEY=your-mistral-api-key-here
LLM_BASE_URL=https://api.mistral.ai/v1
LLM_MODEL=mistral-small-latest
PORT=3001
```

---

## 🛠️ Summary Matrix

| Provider | Base URL (`LLM_BASE_URL`) | Recommended Model (`LLM_MODEL`) | Requires Credit Card? |
| :--- | :--- | :--- | :--- |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4o-mini` | Pay-as-you-go |
| **Google Gemini** | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-3.5-flash` | Free tier available |
| **Groq** | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | Free tier available |
| **DeepSeek** | `https://api.deepseek.com/v1` | `deepseek-chat` | Pay-as-you-go |
| **Ollama** | `http://localhost:11434/v1` | `llama3` | Completely Free (Local) |
| **OpenRouter** | `https://openrouter.ai/api/v1` | `anthropic/claude-3.5-sonnet` | Pay-as-you-go |
| **Together AI** | `https://api.together.xyz/v1` | `meta-llama/Llama-3.3-70B-Instruct-Turbo` | Free trial available |
| **Mistral AI** | `https://api.mistral.ai/v1` | `mistral-small-latest` | Pay-as-you-go |

---

## 📁 Project Structure

```
prompt-generator-app/
├── .env                              # Active environment file (git-ignored)
├── .env.example                      # Template with provider examples
├── README.md                         # Documentation
├── package.json                      # Project dependencies & scripts
├── vite.config.js                    # Vite setup with @ path alias & API proxy
├── server/
│   └── index.js                      # Express proxy server (secures API key)
└── src/
    ├── main.jsx                      # React entry point
    ├── App.jsx                       # Root UI layout
    ├── index.css                     # Tailwind & shadcn CSS variables
    ├── components/
    │   ├── PromptForm.jsx            # Form input & validation
    │   ├── PromptOutput.jsx          # Markdown output, Copy & Test Prompt
    │   └── ui/                       # shadcn UI components (button, card, input, textarea)
    ├── prompts/
    │   └── metaPromptTemplate.js     # Structural XML & CoT prompt builder
    └── services/
        └── llmService.js             # Client service calling /api endpoints
```

---

## 🛡️ Production Deployment Checklist

1. **Deploy Proxy Backend**: Deploy `server/index.js` to a serverless platform (Vercel Functions, Cloudflare Workers, Render, or Railway).
2. **Environment Variables**: Add `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL` in your deployment platform's secret manager.
3. **CORS**: Update `origin` in `server/index.js` to match your production domain.
