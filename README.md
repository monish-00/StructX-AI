# StructX AI

StructX AI is a mobile-friendly RCC learning assistant based on the supplied 22CV52 syllabus. It supports a locally installed Ollama model for private, contextual chat and a Groq free-tier model for hosted chat. Its supported beam flexure calculation stays deterministic. A curated offline response set remains available when no model is configured.

## Run locally

Requires Node.js 20 or newer and Ollama installed on the computer; no Node package installation is needed. This project is configured for the already-installed `llama3:8b-instruct-q4_0` model on this computer.

```powershell
npm start
```

Open <http://127.0.0.1:4173>. Conversations are stored in `data/conversations.json` on this machine. Do not put confidential material in that local history. Ollama runs locally at `http://127.0.0.1:11434`; no cloud API key is needed and prompts stay on this computer.

## Install on a phone

StructX AI is an installable Progressive Web App (PWA); it uses no paid app framework or app-store account. Deploy it over HTTPS first. On Android, open the site in Chrome and use **Install app** (or the browser menu). On iPhone/iPad, open it in Safari, tap **Share**, then **Add to Home Screen**. The PWA caches the app shell, but chat and calculations still need an internet connection to the server. The normal responsive website also works on phones without installing it.

### Enable model-backed answers

Model-backed chat uses Ollama's local OpenAI-compatible API, so it has no per-token API charge and does not require a key. Copy `.env.example` to `.env`; set `AI_MODEL` to a model installed in your Ollama instance, and keep `AI_BASE_URL` at `http://127.0.0.1:11434/v1` for local use. The keyless adapter sends regular chat-completion requests to Ollama. The model must be downloaded separately through Ollama if it is not already installed. Model answers are not web-grounded and do not provide verified code citations. The deterministic local beam calculation is not replaced by model-generated arithmetic.

## Free hosted AI and Render deployment

`render.yaml` defines a free Singapore web service for the PWA and configures Groq's OpenAI-compatible chat endpoint with `openai/gpt-oss-20b`. Groq offers a free API tier with model-specific rate and daily usage caps; availability and limits can change. Create a Groq account and API key, then add it in the Render service's Environment settings as `AI_API_KEY`. The key must stay server-side and must never be committed to Git or embedded in the browser app. Render's Blueprint setup may also prompt for this secret. Without the secret, the site still opens, but model-backed chat is not configured.

For local private use, `.env.example` remains configured for Ollama at `http://127.0.0.1:11434/v1`; your computer must have the model installed and Ollama running. Render cannot reach Ollama running on your computer. The Groq cloud service receives prompts sent from the hosted app, subject to Groq's terms and free-tier limits. Model answers are not web-grounded and are not verified engineering advice; the deterministic beam calculator remains separate. Render's free service can sleep after inactivity and does not preserve server files. In `HOSTED_MODE`, each visitor's conversation history stays in that visitor's browser `localStorage` and does not sync across devices.

Run the automated checks with:

```powershell
npm test
```

## Implemented

- Responsive light/dark interface with home, chat, syllabus, GATE status, formula library, topic focus, and settings views.
- Installable PWA manifest, custom app icon, service worker shell cache, offline page fallback, and an install prompt/help control.
- Server-side Ollama or Groq chat with prior conversation context; when configured, the model handles ordinary chat rather than returning repetitive canned topics. The supported beam flexure calculator and its missing-input prompts stay deterministic.
- Curated offline explanations for several core RCC concepts.
- Conversation creation, local persistence, history search, saved status display, clear history, selectable response mode, copy/export, text/Markdown notes, and issue-report copying.
- 22CV52 Units 1–5 and the supplied topic outline.
- Deterministic limit-state flexural steel calculation for a singly reinforced rectangular section using `b`, `d`, `fck`, `fy`, and `Mu`; validates inputs and reports when the requested moment exceeds its singly reinforced limit.
- Dimension-proportional schematic cross-section download labelled with the supplied `b` and `d`.
- API health, syllabus, chat, local conversation, and text export endpoints.
- Tests for the supported formula path, invalid input, unsupported moment, and honest source/GATE status.

## Not implemented yet

- User accounts and authentication are not included. Hosted AI uses shared provider quotas, so public traffic can consume the free-tier allowance.
- Full section analysis, doubly reinforced/T-beams, loads, shear, deflection, crack control, development length, slab, column, footing, staircase, 2BHK design, or construction detailing.
- PDF extraction, OCR, document indexing/RAG, table/equation extraction, or image interpretation. PDF/image selection only reports that the file was selected; its contents are not sent or analyzed. Text/Markdown uploads may be included in a prompt.
- Licensed/verified Indian Standard documents, current-edition checks, clause/table/page citations, or a verified GATE question bank. The app explicitly flags these as unavailable.
- User accounts, multi-user database, saved calculation catalog, progress tracking, timed tests, downloadable PDF reports, or external issue submission.

## Safety and references

The flexure module is an academic calculation slice, not a complete beam design or construction recommendation. It does not derive loads or perform shear, serviceability, reinforcement detailing, durability, anchorage, or independent source validation. The formula presentation is not a substitute for checking the applicable edition of IS 456 and amendments. No clause or page number is asserted without an accessible verified source. Construction use requires review by a qualified structural engineer.

## API

- `GET /api/health` — local engine/provider status.
- `GET /api/syllabus` — course outline.
- `GET /api/conversations` — locally saved conversation summaries and messages.
- `DELETE /api/conversations` — clear local history.
- `POST /api/chat` — `{ "conversationId": null, "text": "...", "mode": "beginner" }`.
- `PATCH /api/conversations/:id` — `{ "saved": true }`.
- `POST /api/export` — `{ "text": "..." }`, returns text attachment.

## Next development step

Add an independently reviewed calculation specification and reference cases for one next design check (suggested: beam shear); then implement its unit validation, traceable source ingestion, and tests before exposing it as supported.
