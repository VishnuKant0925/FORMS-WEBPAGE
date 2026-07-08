import { Router, Request, Response } from 'express';

const router = Router();

/* ─────────────────────────────────────────────────────────────────────
 * Transliteration Proxy — 4-tier fallback chain
 *
 * Tier 1: Local AI4Bharat Python Server (localhost:8000) — OFFLINE ✅
 *         Always available, no internet needed. Best quality (AI model).
 *
 * Tier 2: AI4Bharat Cloud API (xlit-api.ai4bharat.org)
 *         Currently dead (DNS fail), kept as fallback in case it revives.
 *
 * Tier 3: Google Input Tools API
 *         Blocked by ISRO firewall, kept for non-restricted environments.
 *
 * Tier 4: Raw text passthrough
 *         Returns the typed Roman text as-is. Last resort.
 *
 * Route format: GET /api/xlit-api-proxy/:lang/:text
 * Response:     { result: string[] }
 * ───────────────────────────────────────────────────────────────────── */

// Local Python server URL (AI4Bharat IndicXlit running on port 8000)
const LOCAL_XLIT_URL = process.env.LOCAL_XLIT_URL || 'http://localhost:8000';

router.get('/:lang/:text', async (req: Request, res: Response): Promise<void> => {
  const { lang, text } = req.params;

  // ── Tier 1: Local AI4Bharat Python Server (OFFLINE) ──────────────
  try {
    const localUrl = `${LOCAL_XLIT_URL}/tl/${lang}/${encodeURIComponent(text)}`;
    const response = await fetch(localUrl, { signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const data = await response.json() as any;
      // Local server returns: { success, result: [...], input, at, error }
      if (data.result && data.result.length > 0) {
        res.json({ result: data.result });
        return;
      }
    }
  } catch (error: any) {
    console.warn(`[Translit Proxy] Local AI4Bharat server not available:`, error.message || error);
  }

  // ── Tier 2: AI4Bharat Cloud API ──────────────────────────────────
  try {
    const ai4bharatUrl = `https://xlit-api.ai4bharat.org/tl/${lang}/${encodeURIComponent(text)}`;
    const response = await fetch(ai4bharatUrl, { signal: AbortSignal.timeout(2500) });
    if (response.ok) {
      const data = await response.json();
      res.json(data);
      return;
    }
  } catch (error: any) {
    console.warn(`[Translit Proxy] AI4Bharat cloud failed for text "${text}" lang "${lang}":`, error.message || error);
  }

  // ── Tier 3: Google Input Tools API ───────────────────────────────
  try {
    const googleUrl = `https://inputtools.google.com/request?ime=transliteration_en_${lang}&num=5&cp=0&cs=0&ie=utf-8&oe=utf-8&app=jsapi&text=${encodeURIComponent(text)}`;
    const response = await fetch(googleUrl, { signal: AbortSignal.timeout(2500) });
    if (response.ok) {
      const data = await response.json() as any;
      if (data[0] === 'SUCCESS' && data[1]?.[0]?.[1]) {
        const suggestions: string[] = data[1][0][1];
        res.json({ result: suggestions });
        return;
      }
    }
  } catch (error: any) {
    console.error(`[Translit Proxy] Google Input Tools fallback failed for "${text}":`, error.message || error);
  }

  // ── Tier 4: Raw text fallback ────────────────────────────────────
  res.json({ result: [text] });
});

export default router;
