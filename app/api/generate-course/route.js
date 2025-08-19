import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { topic, level, duration } = body;

    const prompt = `Create a structured learning course about ${topic} for a ${level} student to be completed in ${duration}. 
    Include daily lessons with explanations and short exercises.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert course designer." },
        { role: "user", content: prompt },
      ],
    });

    const course = response.choices[0].message.content;

    return new Response(JSON.stringify({ course }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating course:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate course" }),
      { status: 500 }
    );
  }
}
