import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ISO 639-3 language codes (ElevenLabs expects this format)
const languageToIso639_3: Record<string, string> = {
  sr: "srp",
  en: "eng",
  de: "deu",
  fr: "fra",
  es: "spa",
  it: "ita",
  ru: "rus",
  zh: "zho",
  ja: "jpn",
  ar: "ara",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) throw new Error("ElevenLabs API key not configured");

    const form = await req.formData();
    const audio = form.get("audio");
    const language = (form.get("language") as string | null) ?? undefined;

    if (!audio || !(audio instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing audio file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiForm = new FormData();
    apiForm.append("file", audio);
    apiForm.append("model_id", "scribe_v1");
    apiForm.append("diarize", "false");
    apiForm.append("tag_audio_events", "false");

    const iso = language ? languageToIso639_3[language] : undefined;
    if (iso) apiForm.append("language_code", iso);

    const resp = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: apiForm,
    });

    if (!resp.ok) {
      const error = await resp.text().catch(() => "");
      console.error("ElevenLabs STT error:", error);
      throw new Error(`ElevenLabs STT API error: ${resp.status}`);
    }

    const data = await resp.json();

    return new Response(JSON.stringify({ text: data?.text ?? "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Transcribe Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
