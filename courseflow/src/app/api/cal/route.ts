// pages/api/add-to-calendar.js or app/api/add-to-calendar/route.ts
import { NextResponse } from 'next/server';

interface EventInput {
    summary: string;
    location: string;
    description: string;
    start: {
        dateTime: string;
        timeZone: string;
    };
    end: {
        dateTime: string;
        timeZone: string;
    };
    recurrence?: string[];
    attendees?: { email: string }[];
    reminders?: {
        useDefault: boolean;
        overrides?: { method: string; minutes: number }[];
    };
}

interface RequestBody {
    accessToken: string;
    event: EventInput;
}

export async function POST(req: Request) {
    const { accessToken, event } = (await req.json()) as RequestBody;

    if (!accessToken || !event) {
        return NextResponse.json(
            { error: "Missing required parameters" },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Google API error: ${response.status} ${errorData}`);
        }

        const data = await response.json();
        return NextResponse.json({ success: true, eventId: data.id });
    } catch (error: any) {
        console.error("Error in calendar API:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create calendar event" },
            { status: 500 }
        );
    }
}