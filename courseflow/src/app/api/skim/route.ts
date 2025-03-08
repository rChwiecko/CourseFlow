import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import OpenAI from 'openai';


export async function POST(req: NextRequest) {
    const openai = new OpenAI()
    try {
        const { text } = await req.json();


        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        let extractionPrompt = `You are an expert academic calendar assistant whose primary skill is identifying and extracting dates and scheduled events from course syllabi and academic documents.

            TASK:
            Extract ALL dates, deadlines, and scheduled events from the provided academic document. Focus specifically on:
            - Assignment deadlines
            - Quiz and exam dates
            - Project milestones
            - Presentations
            - Important class sessions
            - Any other time-sensitive academic activities

            FOR EACH EVENT, EXTRACT:
            1. What the event is (exam, assignment, etc.)
            2. The specific date (in original format from the document)
            3. Time (if provided)
            4. Location (if provided)
            5. Brief description with any crucial details
            6. Course/section information if multiple courses are mentioned

            IMPORTANT INSTRUCTIONS:
            - Include ALL dates mentioned in relation to academic activities
            - Maintain the exact date format as written in the document
            - If dates are ambiguous or unclear, include them with a note about the ambiguity
            - Do not include generic dates like semester start/end unless specifically relevant to coursework
            - Do not include historical dates or dates used as examples
            - Ignore dates in citations, references, or publication information
            - Extract dates even if they appear in tables, lists, or unusual formatting
            - Preserve any conditional information (e.g., "Quiz might be moved to Oct 15")

            RESPONSE FORMAT:
            Present your findings as a straightforward list of extracted events, with each event on a new line in this format:
            [Event Type] | [Date] | [Time] | [Location] | [Description]

            DOCUMENT TEXT:
            """
            ${text}
            """`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {role: 'user', content: extractionPrompt},
            ],
            temperature: 0.2,
            });

        return NextResponse.json({ result: completion.choices[0].message.content });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}