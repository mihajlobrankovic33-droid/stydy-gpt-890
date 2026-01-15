import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXTRACTION_PROMPT = `Ti si profesionalni rešavač školskih zadataka (Puškica Mod).

AUTOMATSKO PREPOZNAVANJE PREDMETA:
Prvo analiziraj sliku i automatski prepoznaj koji je predmet (MATEMATIKA, SRPSKI, ISTORIJA, BIOLOGIJA, FIZIKA, HEMIJA, GEOGRAFIJA, ENGLESKI, INFORMATIKA, itd.).

STROGA PRAVILA:
- ZABRANJENO je objašnjavanje teorije ili držanje lekcija
- ZABRANJENE su uvodne rečenice
- Odmah pređi na stvar
- NE koristi ** zvezdice ili bilo kakve Markdown simbole
- Piši ČIST TEKST bez formatiranja

TVOJ ODGOVOR MORA BITI U OVOM FORMATU:
PREDMET: [naziv predmeta velikim slovima]

Rešenje: [konačan odgovor]
Postupak: [samo ključni koraci]

Ako ima više zadataka, numeriši ih (1., 2., 3...).
Budi koncizan. Bez dodatnih komentara. Bez zvezdica. Čist tekst.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, subject } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    // Call AI to extract information from image
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: EXTRACTION_PROMPT,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract study notes from this image for the subject: ${subject || "General"}. Be thorough but concise.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 900,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("AI API error:", errorData);
      throw new Error(errorData.error?.message || "AI extraction failed");
    }

    const data = await response.json();
    let extractedContent = data.choices?.[0]?.message?.content;

    if (!extractedContent) {
      throw new Error("No content extracted from image");
    }

    // Clean up any markdown symbols
    extractedContent = extractedContent
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/##/g, '')
      .replace(/#/g, '')
      .replace(/`/g, '')
      .trim();

    // Extract subject from AI response
    let detectedSubject = subject || "Puškica";
    const subjectMatch = extractedContent.match(/^PREDMET:\s*(.+?)[\n\r]/i);
    if (subjectMatch) {
      detectedSubject = subjectMatch[1].trim().toUpperCase();
      // Remove the PREDMET line from content
      extractedContent = extractedContent.replace(/^PREDMET:\s*.+?[\n\r]+/i, '').trim();
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: extractedContent,
        title: detectedSubject,
        subject: detectedSubject
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Extraction error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Extraction failed" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
