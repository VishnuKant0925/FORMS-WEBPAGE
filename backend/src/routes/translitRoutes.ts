import { Router, Request, Response } from 'express';

const router = Router();

// Route format: /api/xlit-api-proxy/:lang/:text
router.get('/:lang/:text', async (req: Request, res: Response): Promise<void> => {
  const { lang, text } = req.params;

  // AI4Bharat API
  try {
    const ai4bharatUrl = `https://xlit-api.ai4bharat.org/tl/${lang}/${encodeURIComponent(text)}`;
    const response = await fetch(ai4bharatUrl, { signal: AbortSignal.timeout(2500) });
    if (response.ok) {
      const data = await response.json();
      res.json(data);
      return;
    }
  } catch (error: any) {
    console.warn(`[Translit Proxy] AI4Bharat failed for text "${text}" lang "${lang}":`, error.message || error);
  }

  // Google Input Tools API Fallback
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

  // Safe offline / failed fallback
  res.json({ result: [text] });
});

export default router;
