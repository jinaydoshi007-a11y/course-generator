import OpenAI from "openai";

export async function POST(req) {
  const { topic } = await req.json();

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a quiz generator. Output ONLY valid JSON. No explanations.",
        },
        {
          role: "user",
          content: `Create 3 multiple-choice quiz questions about ${topic}. Each question should have 4 answer choices and indicate the correct one. Format like:
          [
            {
              "question": "What is 2+2?",
              "options": ["2","3","4","5"],
              "answer": "4"
            }
          ]`,
        },
      ],
      temperature: 0.7,
    });

    const quiz = JSON.parse(response.choices[0].message.content);

    return new Response(JSON.stringify({ quiz }), { status: 200 });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate quiz" }),
      { status: 500 }
    );
  }
}
