# Transliteration API Reference — NRSC-SLMS Project

## Overview

The NRSC-SLMS project uses **two external transliteration APIs** to convert English (Latin) text into Indian regional scripts (Hindi, Telugu, etc.) in real-time. The backend acts as a proxy ([translitRoutes.ts](file:///c:/Users/vishn/OneDrive/Desktop/ISRO/Regional-Remote/nrsc-slms/backend/src/routes/translitRoutes.ts)) — the frontend calls the backend, and the backend forwards the request to external APIs.

**Architecture:**

```
Frontend  →  Backend Proxy (/api/xlit-api-proxy/:lang/:text)
                 │
                 ├──→  AI4Bharat Xlit API  (Primary)
                 │
                 └──→  Google Input Tools   (Fallback, if AI4Bharat fails)
```

---

## API #1 — AI4Bharat IndicXlit (Primary)

| Field | Details |
|---|---|
| **Endpoint Used** | `https://xlit-api.ai4bharat.org/tl/{lang}/{text}` |
| **Domain** | `xlit-api.ai4bharat.org` |
| **Port / Protocol** | 443 / HTTPS |
| **Authentication** | None (no API key required) |
| **Organization** | AI4Bharat, IIT Madras |
| **License** | MIT (fully open-source) |
| **GitHub Repository** | [github.com/AI4Bharat/IndicXlit](https://github.com/AI4Bharat/IndicXlit) |
| **Homepage** | [ai4bharat.iitm.ac.in](https://ai4bharat.iitm.ac.in/) |
| **Status** | Free, public-facing research API — no SLA or guaranteed uptime |

### How It Works

- A simple `GET` request with the target language code and English text returns an array of transliterated suggestions.
- Example: `GET https://xlit-api.ai4bharat.org/tl/hi/namaste` → returns Hindi transliterations of "namaste".

### Source & Availability

- This API is hosted by the **AI4Bharat research group at IIT Madras**.
- It is a **free, public demo API** — no registration or API key is needed.
- It is **not a commercial/enterprise API** — there is no official SLA, rate-limit documentation, or production guarantee.
- The full model and inference code are available on GitHub under the **MIT License**, making **self-hosting** a viable option.

---

## API #2 — Google Input Tools (Fallback)

| Field | Details |
|---|---|
| **Endpoint Used** | `https://inputtools.google.com/request?ime=transliteration_en_{lang}&num=5&cp=0&cs=0&ie=utf-8&oe=utf-8&app=jsapi&text={text}` |
| **Domain** | `inputtools.google.com` |
| **Port / Protocol** | 443 / HTTPS |
| **Authentication** | None |
| **Organization** | Google |
| **Official Documentation** | ❌ **None** — this is an undocumented, unofficial API |
| **Status** | Undocumented internal Google endpoint; can change or be blocked without notice |

### How It Works

- A `GET` request returns a JSON response. On success, `data[0]` is `"SUCCESS"` and `data[1][0][1]` contains an array of transliterated suggestions.
- The `ime` parameter specifies the input method (e.g., `transliteration_en_hi` for English → Hindi).

### Source & Availability

- This endpoint powers the **Google Input Tools** Chrome extension and web widget.
- Google does **NOT** officially publish this as a public API for third-party use.
- There is **no documentation, no terms of service, and no API key** for this endpoint.
- **Risk:** Google may change the URL, response format, or block programmatic access at any time.
- Google's **official paid alternative** is the [Google Cloud Translation API](https://cloud.google.com/translate/docs), but it focuses on *translation*, not *transliteration* specifically.

---

## Firewall / Proxy Whitelisting

For the transliteration feature to work in a restricted network environment, the following domains must be accessible from the **backend server**:

| Domain | Protocol | Purpose |
|---|---|---|
| `xlit-api.ai4bharat.org` | HTTPS (443) | AI4Bharat transliteration (primary) |
| `inputtools.google.com` | HTTPS (443) | Google Input Tools transliteration (fallback) |

> [!IMPORTANT]
> Only the **backend server** needs outbound access to these domains. The frontend communicates only with the backend proxy.

---

## Alternatives for Restricted / Production Environments

### Option 1: Self-Host AI4Bharat IndicXlit (Recommended)

Since IndicXlit is **fully open-source (MIT License)**, it can be deployed on an internal server:

1. Clone the repository: `git clone https://github.com/AI4Bharat/IndicXlit.git`
2. Follow the setup instructions to deploy the inference server internally.
3. Update the backend proxy URL in [translitRoutes.ts](file:///c:/Users/vishn/OneDrive/Desktop/ISRO/Regional-Remote/nrsc-slms/backend/src/routes/translitRoutes.ts) (line 11):
   ```typescript
   // Change from:
   const ai4bharatUrl = `https://xlit-api.ai4bharat.org/tl/${lang}/${encodeURIComponent(text)}`;
   // To:
   const ai4bharatUrl = `http://your-internal-server:port/tl/${lang}/${encodeURIComponent(text)}`;
   ```
4. This eliminates all external network dependencies.

### Option 2: Bhashini (Government of India Platform)

- **Website:** [bhashini.gov.in](https://bhashini.gov.in/)
- **About:** Government of India's national language technology platform (under MeitY / Digital India).
- Provides official transliteration, translation, ASR, and TTS APIs.
- May be **easier to approve** through government/ISRO network firewalls since it is a government-backed service.
- Requires registration for API access via the Bhashini portal.

### Option 3: Offline / Fallback Mode

The current code already includes a safe fallback — if both APIs fail, the original English text is returned as-is:

```typescript
// Line 39 in translitRoutes.ts
res.json({ result: [text] });
```

This ensures the application does **not crash** if no transliteration service is reachable.

---

## Summary Table

| API | Type | Free? | API Key? | Official? | Self-Hostable? | Recommended for Production? |
|---|---|---|---|---|---|---|
| AI4Bharat IndicXlit | Public research API | ✅ Yes | ❌ No | ✅ Yes (by AI4Bharat) | ✅ Yes (MIT License) | ⚠️ Self-host for production |
| Google Input Tools | Undocumented internal API | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ Not recommended |
| Bhashini | Government platform | ✅ Yes | ✅ Yes (registration) | ✅ Yes (Govt. of India) | ❌ No | ✅ Yes |

---

*Document created: 2026-07-07 | Project: NRSC-SLMS*
