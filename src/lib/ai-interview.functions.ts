import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Msg = { role: "system" | "user" | "assistant"; content: string };

export const aiInterviewReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { topic: string; messages: Msg[] }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");

    const system: Msg = {
      role: "system",
      content: `You are a friendly but rigorous technical interviewer for the topic: "${data.topic || "general software engineering"}".
Conduct a realistic interview:
- Ask ONE focused question at a time.
- After the candidate answers, give brief honest feedback (what was good, what to improve), then ask the next question.
- Vary difficulty. Cover concepts, problem-solving, and follow-ups.
- Keep responses concise (max ~150 words).
- If the candidate types "feedback" or "summary", give an overall performance review.
Start by greeting the candidate and asking your first question.`,
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
    const reply: string = json.choices?.[0]?.message?.content ?? "(no response)";
    return { reply };
  });
