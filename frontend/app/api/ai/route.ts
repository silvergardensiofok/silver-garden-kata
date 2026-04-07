import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = body?.question || "";

    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: [
        {
          role: "system",
          content: "You are a helpful hotel receptionist at Silver Garden Siófok. Answer short and clear."
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    return NextResponse.json({
      answer: response.output_text
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}