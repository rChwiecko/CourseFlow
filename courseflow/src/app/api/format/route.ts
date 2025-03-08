import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';



export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();


        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const prompt = `You are an expert assistant specialized in processing academic documents. Your task is to extract all important dates from the provided course syllabus text, including exams, quizzes, assignment deadlines, and any other scheduled academic events. The output must be a well-formatted JSON object and should strictly follow the schema provided below. Do not include any additional text or commentary.

        ### Input Syllabus Text:
        """
        [INSERT THE TEXT EXTRACTED FROM THE PDF SYLLABUS HERE]
        Example:
        Course: Introduction to Data Science
        Instructor: Dr. Jane Doe
        Important Dates:
        - Midterm Exam: October 15, 2025 at 10:00 AM in Room 101.
        - Quiz 1: September 30, 2025.
        - Final Exam: December 10, 2025 at 2:00 PM.
        - Project Proposal Due: November 1, 2025.
        """
        
        ### Required JSON Schema:
        \`\`\`json
        {
          "course": "<course name>",
          "instructor": "<instructor name>",
          "events": [
            {
              "event_type": "<exam/quiz/assignment/etc>",
              "description": "<detailed description if available>",
              "date": "<YYYY-MM-DD>",
              "time": "<HH:MM (24-hour format) or null if not specified>",
              "location": "<location if available or null>"
            }
            // ... additional events as needed
          ]
        }
        \`\`\``;
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        const chatStream = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{
                role: "system",
                content: prompt,
            },{
                role: "user",
                content: "Create the JSON object with the extracted dates:  \n " + text,
            }
        ],
            stream: true,
        });

        let responseText = '';

        for await (const chunk of chatStream) {
            responseText += chunk.choices[0]?.delta?.content || '';
        }

        return NextResponse.json({ result: responseText });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}