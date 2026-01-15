import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Language instructions for AI
const languageInstructions: Record<string, string> = {
  sr: "Ti si prijateljski AI asistent. MORAŠ odgovarati ISKLJUČIVO na srpskom jeziku. Budi kratak i jasan.",
  en: "You are a friendly AI assistant. You MUST respond ONLY in English. Be concise and clear.",
  de: "Du bist ein freundlicher KI-Assistent. Du MUSST AUSSCHLIESSLICH auf Deutsch antworten. Sei prägnant und klar.",
  fr: "Tu es un assistant IA amical. Tu DOIS répondre UNIQUEMENT en français. Sois concis et clair.",
  es: "Eres un asistente de IA amigable. DEBES responder ÚNICAMENTE en español. Sé conciso y claro.",
  it: "Sei un assistente IA amichevole. DEVI rispondere SOLO in italiano. Sii conciso e chiaro.",
  ru: "Ты дружелюбный ИИ-ассистент. Ты ДОЛЖЕН отвечать ТОЛЬКО на русском языке. Будь кратким и понятным.",
  zh: "你是一个友好的AI助手。你必须只用中文回答。简洁明了。",
  ja: "あなたはフレンドリーなAIアシスタントです。日本語のみで回答してください。簡潔で明確に。",
  ar: "أنت مساعد ذكاء اصطناعي ودود. يجب أن ترد باللغة العربية فقط. كن موجزًا وواضحًا.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language = "sr" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!message) {
      throw new Error("Message is required");
    }

    const systemPrompt = languageInstructions[language] || languageInstructions.en;

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI API error:", error);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Voice chat error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
