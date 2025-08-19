// pages/api/generate-course.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { subject, level, duration } = req.body || {};

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ message: "Missing OPENAI_API_KEY in .env.local" });
  }
  if (!subject || !level || !duration) {
    return res.status(400).json({ message: "Missing subject, level, or duration" });
  }

  const prompt = `
You are an expert course designer. Create a complete learning course for the subject "${subject}".
The student is a "${level}" learner and has ${duration} days to complete the course.

Output requirements:
- Title line: "Course: <name> (<level>) — <duration> days"
- Then a clear day-by-day plan (Day 1 ... Day ${duration})
- For each day include:
  • Lesson objectives (short)
  • Explanation/notes (1–2 short paragraphs)
  • 3–5 practice problems (numbered)
  • A short daily quiz (3 multiple-choice Qs with correct answers marked)
- Keep it concise, direct, and well formatted with line breaks.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // fast + cost-effective; upgrade to gpt-4o later if you want
        messages: [
          { role: "system", content: "You are a helpful AI course creator." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1800, // adjust if needed
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Surface OpenAI error message cleanly to the client
      const msg = data?.error?.message || "OpenAI API error";
      return res.status(response.status).json({ message: msg });
    }

    const course = data?.choices?.[0]?.message?.content || "";
    return res.status(200).json({ course });
  } catch (error) {
    console.error("API route error:", error);
    return res.status(500).json({ message: "Server error generating course" });
  }
}
