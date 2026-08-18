import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Msg = { role: "system" | "user" | "assistant"; content: string };

export type InterviewReply = {
  reply: string;
  rating: number | null;
  strengths: string[];
  improvements: string[];
};

function safeParse(raw: string): InterviewReply {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      const o = JSON.parse(cleaned.slice(start, end + 1));
      const r = typeof o.rating === "number" ? Math.max(0, Math.min(10, o.rating)) : null;
      return {
        reply: String(o.reply ?? "").trim() || raw,
        rating: r,
        strengths: Array.isArray(o.strengths) ? o.strengths.map(String).slice(0, 4) : [],
        improvements: Array.isArray(o.improvements) ? o.improvements.map(String).slice(0, 4) : [],
      };
    } catch {
      /* fall through */
    }
  }
  return { reply: raw, rating: null, strengths: [], improvements: [] };
}

export const aiInterviewReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { topic: string; messages: Msg[] }) => data)
  .handler(async ({ data }): Promise<InterviewReply> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");

    const system: Msg = {
      role: "system",
      content: `You are a rigorous but friendly technical interviewer for the topic: "${data.topic || "general software engineering"}".

Rules:
- Ask ONE focused question at a time, varying difficulty.
- The candidate may answer by voice, so answers can be informal or have transcription errors — judge the substance.
- ALWAYS respond with STRICT JSON only, no markdown fences, matching:
{"reply": string, "rating": number|null, "strengths": string[], "improvements": string[]}
- "reply": short spoken-style text (max ~120 words): brief feedback on their last answer (skip feedback if there was no answer yet), then the next question.
- "rating": score of the candidate's LAST answer out of 10 (integer 0-10). Use null only when the candidate has not answered anything yet.
- "strengths": 1-3 short bullets on what was good.
- "improvements": 1-3 short, concrete bullets on exactly what to improve.
- If the candidate asks for "summary" or "feedback", give an overall review in "reply" and set "rating" to their overall performance out of 10.
Start by greeting the candidate briefly and asking the first question.`,
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [system, ...data.messages],
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached, please wait a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in your workspace.");
    if (!res.ok) throw new Error(`AI error: ${res.status}`);

    const json = await res.json();
    const raw: string = json.choices?.[0]?.message?.content ?? "(no response)";
    return safeParse(raw);
  });
