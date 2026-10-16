# StructX AI

StructX AI is a mobile-installable RCC learning assistant based on the supplied 22CV52 syllabus. With its server-side Gemini connection configured, it uses conversation context to answer general questions; its supported beam flexure calculation remains deterministic. A curated offline response set remains available when no model key is configured.

## Run locally

Requires Node.js 20 or newer; no package installation is needed.

```powershell
npm start
```

Open <http://127.0.0.1:4173>. Conversations are stored in `data/conversations.json` on this machine. Do not put confidential material in that local history.

## Install on a phone

StructX AI is an installable Progressive Web App (PWA); it uses no paid app framework or app-store account. Deploy it over HTTPS first. On Android, open the site in Chrome and use **Install app** (or the browser menu). On iPhone/iPad, open it in Safari, tap **Share**, then **Add to Home Screen**. The PWA caches the app shell, but chat and calculations still need an internet connection to the server. The normal responsive website also works on phones without installing it.

### Enable model-backed answers

The app is wired to Google's OpenAI-compatible Gemini API. To run model-backed chat locally, copy `.env.example` to `.env`, create a key in [Google AI Studio](https://aistudio.google.com/app/apikey), set `AI_API_KEY`, then restart the server. The default model is `gemini-3.8-flash`; the URL and model can be changed in `.env`. Keep the key on the server: it is never sent to browser JavaScript and must not be committed. Google's Gemini API lists a free tier for Gemini 3.8 Flash, with quotas and availability subject to Google's account and rate limits. Free-tier prompts may be used to improve Google's products. The chatbot does not use search grounding, so it does not provide live web research or verified code citations. The deterministic local beam calculation is not replaced by model-generated arithmetic.

## Render deployment

`render.yaml` defines a free Singapore web service with Gemini configuration and an unset secret key. During initial Blueprint creation, Render asks for `AI_API_KEY`; for an already-created service, add that variable in its Environment settings. Never put the secret in the Blueprint YAML or GitHub. The app uses Gemini 3.8 Flash's free tier (quota limits apply); no paid-tier model or search-grounding feature is enabled. Render's free service sleeps after inactivity and does not preserve server files. In `HOSTED_MODE`, each visitor's conversation history stays in that visitor's browser `localStorage` and does not sync across devices. The public hosted chat uses the server-side key, so keep that key on the free-tier project and rotate/remove it if abused.

Run the automated checks with:

```powershell
npm test
```

## Implemented

- Responsive light/dark interface with home, chat, syllabus, GATE status, formula library, topic focus, and settings views.
- Installable PWA manifest, custom app icon, service worker shell cache, offline page fallback, and an install prompt/help control.
- Server-side Gemini 3.8 Flash chat with prior conversation context; when configured, the model handles ordinary chat rather than returning repetitive canned topics. The supported beam flexure calculator and its missing-input prompts stay deterministic.
- Curated offline explanations for several core RCC concepts.
- Conversation creation, local persistence, history search, saved status display, clear history, selectable response mode, copy/export, text/Markdown notes, and issue-report copying.
- 22CV52 Units 1–5 and the supplied topic outline.
- Deterministic limit-state flexural steel calculation for a singly reinforced rectangular section using `b`, `d`, `fck`, `fy`, and `Mu`; validates inputs and reports when the requested moment exceeds its singly reinforced limit.
- Dimension-proportional schematic cross-section download labelled with the supplied `b` and `d`.
- API health, syllabus, chat, local conversation, and text export endpoints.
- Tests for the supported formula path, invalid input, unsupported moment, and honest source/GATE status.

## Not implemented yet

- No provider key is bundled. Model-backed chat works after configuring `AI_API_KEY` locally or in Render. Without it, the app uses curated offline responses.
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
