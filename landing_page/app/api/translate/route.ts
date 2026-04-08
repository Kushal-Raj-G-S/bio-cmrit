import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/translate
 * Proxies translation requests to Sarvam AI's /translate endpoint.
 * Keeps the API key server-side so it never leaks to the browser.
 *
 * Body: { input: string, source_language_code: string, target_language_code: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, source_language_code, target_language_code } = body;

    if (!input || !target_language_code) {
      return NextResponse.json(
        { error: "Missing required fields: input, target_language_code" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SARVAM_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    const sarvamResponse = await fetch("https://api.sarvam.ai/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        input,
        source_language_code: source_language_code || "en-IN",
        target_language_code,
        model: "sarvam-translate:v1",
        mode: "formal",
      }),
    });

    if (!sarvamResponse.ok) {
      const errorText = await sarvamResponse.text();
      console.error(`Sarvam API error (${sarvamResponse.status}):`, errorText);
      return NextResponse.json(
        { error: `Sarvam API error: ${sarvamResponse.status}` },
        { status: sarvamResponse.status }
      );
    }

    const data = await sarvamResponse.json();
    return NextResponse.json({
      translated_text: data.translated_text,
      source_language_code: data.source_language_code,
    });
  } catch (error: any) {
    console.error("Translation proxy error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
