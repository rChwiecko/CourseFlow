// app/api/pdf-chunk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as pdfParse from 'pdf-parse';

/**
 * Splits the text from a PDF buffer into chunks.
 */
async function pdfChunk(
  pdfBuffer: Buffer, 
  limit: number = 4000, 
  overlap: number = 1000
): Promise<string[]> {
  try {
    // Parse the PDF using pdf-parse
    const pdfData = await pdfParse(pdfBuffer);

    // Use the extracted text
    let text: string = pdfData.text;
    let chunks: string[] = [];

    // While the remaining text is longer than the limit,
    // take a chunk of size "limit", then set the text to start from (limit - overlap)
    while (text.length > limit) {
      chunks.push(text.substring(0, limit));
      text = text.substring(limit - overlap);
    }

    // Add the last chunk if any text remains.
    if (text.length) {
      chunks.push(text);
    }

    return chunks;
  } catch (err) {
    console.error("Error processing PDF:", err);
    throw err;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File;
    
    // Get chunking parameters
    const limit = parseInt(formData.get('limit') as string) || 4000;
    const overlap = parseInt(formData.get('overlap') as string) || 1000;
    
    if (!pdfFile) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Process the PDF
    const chunks = await pdfChunk(buffer, limit, overlap);
    
    // Return the chunks
    return NextResponse.json({ 
      chunks,
      totalChunks: chunks.length,
      fileName: pdfFile.name
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF: ' + (error as Error).message },
      { status: 500 }
    );
  }
}