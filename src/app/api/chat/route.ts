import { NextRequest, NextResponse } from "next/server";

/* ─── OpenRouter Config ─── */
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'message' field." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    // 1. RAG Context Extraction
    const msgLower = message.toLowerCase();
    let taktik: string | null = null;
    let lini: string | null = null;

    if (msgLower.includes("quick counter")) taktik = "quick_counter";
    else if (msgLower.includes("possession")) taktik = "possession";
    else if (msgLower.includes("out wide")) taktik = "out_wide";
    else if (msgLower.includes("long ball")) taktik = "long_ball_counter";

    if (msgLower.includes("midfield") || msgLower.includes("tengah")) lini = "tengah";
    else if (msgLower.includes("defender") || msgLower.includes("belakang") || msgLower.includes("cb") || msgLower.includes("lb") || msgLower.includes("rb")) lini = "belakang";
    else if (msgLower.includes("forward") || msgLower.includes("winger") || msgLower.includes("depan") || msgLower.includes("cf") || msgLower.includes("st") || msgLower.includes("striker")) lini = "depan";

    let contextString = "";
    if (taktik || lini) {
      const reqTaktik = taktik || "long_ball_counter";
      const reqLini = lini || "depan";

      try {
        const backendRes = await fetch("https://pratamuy-efhub-backend-api.hf.space/get-players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taktik: reqTaktik, lini: reqLini }),
        });

        if (backendRes.ok) {
          const backendData = await backendRes.json();
          if (backendData.players && backendData.players.length > 0) {
            const top5 = backendData.players.slice(0, 5);
            contextString = "Top players from database: " + top5.map((p: any, i: number) => `${i + 1}. ${p.name} (OVR ${p.ovr})`).join(", ");
          }
        }
      } catch (error) {
        console.error("[RAG Error]:", error);
      }
    }

    // 2. Build final system prompt (Conditional RAG — no forced out-of-position)
    const finalSystemPrompt = `You are STRATEGIST AI, an elite eFootball tactical assistant.

ABSOLUTE RULES:
1. NO INTERNAL MONOLOGUE. NO THINKING OUT LOUD.
2. Begin your response IMMEDIATELY with a Markdown heading (e.g., "## Tactical Setup").
3. NEVER use introductory phrases like "Okay", "Let me think", or "The user is asking".
4. CONDITIONAL PLAYER RULES: If you need to suggest specific players, you MUST ONLY use names from the Database Context below.
5. CRITICAL: If the Database Context does not contain players suitable for the tactical role (e.g., you need a DMF but the context only has CFs), DO NOT force them into the wrong role! Instead, give pure tactical advice WITHOUT naming any specific players.

DATABASE CONTEXT:
${contextString || "No specific player context available. Use your general eFootball knowledge."}
`;

    // Build messages array: system + recent history + new user message
    const messages = [
      { role: "system", content: finalSystemPrompt },
    ];

    // Include up to 6 recent history messages for context
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        messages.push({
          role: h.sender === "user" ? "user" : "assistant",
          content: h.text,
        });
      }
    }

    messages.push({ role: "user", content: message });

    // Call OpenRouter
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "EFHub Tactical AI",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("\n[OPENROUTER FATAL ERROR]:", response.status, errorText, "\n");

      return NextResponse.json(
        { error: "OpenRouter Failed", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    let cleanResponse: string = data.choices?.[0]?.message?.content || "I apologize, I couldn't generate a response. Please try again.";

    /* ─── Regex Muzzle: strip reasoning model artifacts ─── */
    // 1. Strip <think>...</think> blocks (DeepSeek-R1 and similar reasoning models)
    cleanResponse = cleanResponse.replace(/<think>[\s\S]*?<\/think>/gi, "");
    // 2. Strip rogue opening monologue lines that survived the system prompt
    cleanResponse = cleanResponse.replace(/^(Okay,|Let me think|The user is asking|Here is|Sure,|Of course,|Alright,).*?\n/im, "");
    // 3. Final trim
    cleanResponse = cleanResponse.trim();

    if (!cleanResponse) cleanResponse = "I apologize, I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply: cleanResponse });
  } catch (error) {
    console.error("[API /chat] Internal error:", error);
    return NextResponse.json(
      { error: "Internal server error while processing your request." },
      { status: 500 }
    );
  }
}
