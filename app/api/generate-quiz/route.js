import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { course } = await req.json();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI that generates quizzes as structured JSON."
        },
        {
          role: "user",
          content: `Based on this course content, create a 5-question multiple-choice quiz. 
          Each question should have:
          - "question" (string)
          - "options" (array of 4 strings)
          - "answer" (the correct option as string)

          Return ONLY valid JSON in this format:
          {
            "quiz": [
              {
                "question": "What is ...?",
                "options": ["A", "B", "C", "D"],
                "answer": "B"
              }
            ]
          }

          Course Content: ${course}`
        }
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content;

    // Try parsing JSON
    let quizData;
    try {
      quizData = JSON.parse(raw);
    } catch (err) {
      console.error("Failed to parse quiz JSON:", raw);
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    return NextResponse.json(quizData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Quiz generation failed" }, { status: 500 });
  }
}
