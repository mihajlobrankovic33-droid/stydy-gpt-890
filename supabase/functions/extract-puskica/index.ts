import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXTRACTION_PROMPT = `You are an expert study note extractor. Analyze the image provided and extract ONLY the most important information for quick studying.

EXTRACT ONLY:
• Formulas (mathematical, physics, chemistry formulas)
• Definitions (key terms and their meanings)
• Dates (important historical dates and events)
• Key People (important names and their contributions)

FORMAT RULES:
- Use bullet points (•) for each item
- Keep each point SHORT and CONCISE (max 1-2 lines)
- Group by category if multiple types exist
- Use clear, simple language
- No lengthy explanations - just facts
- If a category has no content in the image, skip it

OUTPUT FORMAT:
📐 FORMULE:
• [formula 1]
• [formula 2]

📖 DEFINICIJE:
• [term]: [short definition]

📅 DATUMI:
• [date] - [event]

👤 KLJUČNE OSOBE:
• [name] - [contribution]

Only include categories that have relevant content from the image. Be thorough but concise.`;

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
        model: "google/gemini-2.5-flash",
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
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("AI API error:", errorData);
      throw new Error(errorData.error?.message || "AI extraction failed");
    }

    const data = await response.json();
    const extractedContent = data.choices?.[0]?.message?.content;

    if (!extractedContent) {
      throw new Error("No content extracted from image");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: extractedContent,
        title: subject || "Puškica"
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
