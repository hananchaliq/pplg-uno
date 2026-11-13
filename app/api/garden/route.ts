import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { buildGardenBlueprint, GardenPreferencesInput } from '@/lib/class-logic';

function createProceduralGardenIllustrationDataUri(
  style: string,
  promptText: string,
  sunlight: string,
  plants: Array<{ name: string; colorHex: string; xPercent: number; yPercent: number }>
): string {
  const safeTitle = (style || 'Tropis Rindang').replace(/[<>&"]/g, '');
  const safeSub = (promptText || `Pencahayaan ${sunlight}`).slice(0, 65).replace(/[<>&"]/g, '');
  const circles = plants
    .map(
      (p, idx) => `
      <g transform="translate(${Math.round(p.xPercent * 7.2)}, ${Math.round(p.yPercent * 4.2)})">
        <circle cx="40" cy="40" r="${28 + (idx % 3) * 8}" fill="${p.colorHex}" fill-opacity="0.28" stroke="${p.colorHex}" stroke-width="2" />
        <circle cx="40" cy="40" r="8" fill="${p.colorHex}" />
        <text x="40" y="84" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="600" fill="#0B0D14">${p.name.replace(/[<>&"]/g, '')}</text>
      </g>`
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="sky" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#DDEBD6" />
        <stop offset="50%" stop-color="#CFEBE2" />
        <stop offset="100%" stop-color="#D3E6F3" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0B0D14" stroke-opacity="0.06" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="800" height="500" rx="28" fill="url(#sky)" />
    <rect width="800" height="500" rx="28" fill="url(#grid)" />
    <!-- Stepping stone pathway -->
    <path d="M 90 420 Q 280 310 430 330 T 720 180" fill="none" stroke="#FFFFFF" stroke-opacity="0.75" stroke-width="34" stroke-linecap="round" stroke-dasharray="2 48" />
    <!-- Water pond accent -->
    <ellipse cx="610" cy="340" rx="95" ry="58" fill="#4FA3E0" fill-opacity="0.32" stroke="#FFFFFF" stroke-width="2" />
    ${circles}
    <rect x="28" y="28" width="440" height="68" rx="16" fill="#FFFFFF" fill-opacity="0.78" />
    <text x="48" y="56" font-family="ui-sans-serif, system-ui, sans-serif" font-size="18" font-weight="700" fill="#0B0D14">Visualisasi: ${safeTitle}</text>
    <text x="48" y="78" font-family="ui-monospace, SFMono-Regular, monospace" font-size="12" fill="#5B6073">${safeSub}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const style = (body.style || 'Tropis Rindang') as GardenPreferencesInput['style'];
    const sunlight = (body.sunlight || 'Semi-Teduh') as GardenPreferencesInput['sunlight'];
    const soilType = (body.soilType || 'Humus Organik') as GardenPreferencesInput['soilType'];
    const widthMeters = Number(body.widthMeters) || 6;
    const lengthMeters = Number(body.lengthMeters) || 4;
    const customPrompt = String(body.customPrompt || '').trim();
    const editInstruction = String(body.editInstruction || '').trim();
    const sourceImageBase64 = body.sourceImageBase64 ? String(body.sourceImageBase64) : undefined;

    const baseBlueprint = buildGardenBlueprint({
      style,
      sunlight,
      soilType,
      widthMeters,
      lengthMeters,
      customPrompt: editInstruction ? `${customPrompt} (${editInstruction})` : customPrompt,
    });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return NextResponse.json({
        blueprint: {
          ...baseBlueprint,
          visualUrl: createProceduralGardenIllustrationDataUri(
            style,
            editInstruction || customPrompt || baseBlueprint.title,
            sunlight,
            baseBlueprint.plants
          ),
        },
        mode: 'procedural-fallback',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // 1. Try enriching plant layout recommendations via gemini-4-hydrogen
    try {
      const textPrompt = `Buat rekomendasi desain taman impian bergaya "${style}" ukuran ${widthMeters}x${lengthMeters} meter dengan cahaya "${sunlight}" dan tanah "${soilType}". Catatan tambahan pengguna: "${customPrompt || 'Teras kelas & rumah yang asri'}". ${editInstruction ? `Instruksi revisi: "${editInstruction}".` : ''} Berikan ringkasan singkat Bahasa Indonesia (2 kalimat) dan 5 tanaman spesifik yang cocok.`;

      const textResp = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: textPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              plants: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    latinName: { type: Type.STRING },
                    layer: { type: Type.STRING },
                    careTip: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      if (textResp.text) {
        const parsed = JSON.parse(textResp.text.trim());
        if (parsed.title) baseBlueprint.title = parsed.title;
        if (parsed.summary) baseBlueprint.summary = parsed.summary;
        if (Array.isArray(parsed.plants) && parsed.plants.length > 0) {
          baseBlueprint.plants = baseBlueprint.plants.map((existing, i) => {
            const p = parsed.plants[i];
            if (!p) return existing;
            return {
              ...existing,
              name: p.name || existing.name,
              latinName: p.latinName || existing.latinName,
              careTip: p.careTip || existing.careTip,
            };
          });
        }
      }
    } catch {
      // Keep deterministic blueprint on text model fallback
    }

    // 2. Try generating or editing garden visual using gemini-nano-banana-2.1
    let generatedImageUrl: string | undefined;
    try {
      const imagePrompt = editInstruction
        ? `Edit this garden design visualization: ${editInstruction}. Style: ${style}, ${sunlight} lighting, lush botanical architectural rendering, soft pastel daylight.`
        : `Architectural landscape design visualization of a dream garden, style ${style}, dimensions ${widthMeters}x${lengthMeters}m, ${sunlight} lighting, featuring ${baseBlueprint.plants.map((p) => p.name).join(', ')}. ${customPrompt}. Clean isometric/aerial botanical concept art, soft natural daylight, high detail.`;

      const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];
      if (sourceImageBase64 && sourceImageBase64.startsWith('data:image/')) {
        const [meta, rawB64] = sourceImageBase64.split(',');
        const mimeMatch = meta.match(/data:(.*?);base64/);
        if (rawB64 && !meta.includes('svg+xml')) {
          parts.push({
            inlineData: {
              data: rawB64,
              mimeType: mimeMatch?.[1] || 'image/png',
            },
          });
        }
      }
      parts.push({ text: imagePrompt });

      const imgResp = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: '16:9',
            imageSize: '1K',
          },
        },
      });

      for (const part of imgResp.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType ?? 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch {
      // Paid model declined or unavailable -> use procedural illustration fallback
    }

    return NextResponse.json({
      blueprint: {
        ...baseBlueprint,
        visualUrl:
          generatedImageUrl ??
          createProceduralGardenIllustrationDataUri(
            style,
            editInstruction || customPrompt || baseBlueprint.title,
            sunlight,
            baseBlueprint.plants
          ),
      },
      mode: generatedImageUrl ? 'gemini-nano-banana-2.1' : 'procedural-svg',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal membuat desain taman.' },
      { status: 500 }
    );
  }
}
