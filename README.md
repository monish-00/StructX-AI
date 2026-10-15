# StructX AI

StructX AI is a local-first RCC learning workspace based on the supplied 22CV52 syllabus. It has curated offline answers for common RCC concepts, a deterministic beam flexure calculation, and an optional server-side OpenAI-compatible chat-completions adapter for broader questions.

## Run locally

Requires Node.js 20 or newer; no package installation is needed.

```powershell
npm start
```

Open <http://127.0.0.1:4173>. Conversations are stored in `data/conversations.json` on this machine. Do not put confidential material in that local history.

## Install on a phone

StructX AI is an installable Progressive Web App (PWA); it uses no paid app framework or app-store account. Deploy it over HTTPS first. On Android, open the site in Chrome and use **Install app** (or the browser menu). On iPhone/iPad, open it in Safari, tap **Share**, then **Add to Home Screen**. The PWA caches the app shell, but chat and calculations still need an internet connection to the server. The normal responsive website also works on phones without installing it.

### Enable model-backed answers

The app does not include an AI key. Copy `.env.example` to `.env` and set `AI_API_KEY`, `AI_MODEL`, and `AI_BASE_URL` to values from your chosen OpenAI-compatible provider. `AI_BASE_URL` is the provider API root (for example `https://api.openai.com/v1`); the server appends `/chat/completions`. Restart the server after changing `.env`. The key stays in the Node backend and is never sent to browser JavaScript. The provider must allow network access from this machine. Without these settings the app uses its limited offline answer set and explains that general model chat is unavailable.

## Render deployment

`render.yaml` defines a free Singapore web service with a health check. Render's free service sleeps after inactivity, and it does not preserve server files. In `HOSTED_MODE`, the API is stateless and each visitor's conversation history stays in that visitor's browser `localStorage`; history does not sync across devices. No AI provider key is configured by the blueprint, so the hosted version does not expose a billable unauthenticated model proxy. To deploy, push this project to a Git repository, connect that repository in Render, and create a Blueprint from `render.yaml`. This project does not currently have a Git remote or hosting account connection.

Run the automated checks with:

```powershell
npm test
```

## Implemented

- Responsive light/dark interface with home, chat, syllabus, GATE status, formula library, topic focus, and settings views.
- Installable PWA manifest, custom app icon, service worker shell cache, offline page fallback, and an install prompt/help control.
- Optional server-side OpenAI-compatible chat-completions adapter with prior conversation context, bounded message sizes, request timeout, and honest provider error handling.
- Curated offline explanations for several core RCC concepts.
- Conversation creation, local persistence, history search, saved status display, clear history, selectable response mode, copy/export, text/Markdown notes, and issue-report copying.
- 22CV52 Units 1–5 and the supplied topic outline.
- Deterministic limit-state flexural steel calculation for a singly reinforced rectangular section using `b`, `d`, `fck`, `fy`, and `Mu`; validates inputs and reports when the requested moment exceeds its singly reinforced limit.
- Dimension-proportional schematic cross-section download labelled with the supplied `b` and `d`.
- API health, syllabus, chat, local conversation, and text export endpoints.
- Tests for the supported formula path, invalid input, unsupported moment, and honest source/GATE status.

## Not implemented yet

- No provider key is bundled. Model-backed general conversation works only after configuring a compatible provider in local `.env`.
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
