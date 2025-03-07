'use client';

import * as pdfjsLib from 'pdfjs-dist';

// We're going to use a different approach to initialize the worker
let workerInitialized = false;

/**
 * Initialize the PDF.js worker with a reliable method
 */
async function initializeWorker() {
  if (typeof window !== 'undefined' && !workerInitialized) {
    try {
      // Use dynamic import() to get worker data
      const workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString();
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
      workerInitialized = true;
    } catch (error) {
      console.error('Failed to initialize PDF.js worker:', error);
      
      // Fallback to using a raw string setter (less reliable)
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          '/pdf.worker.min.js'; // Assumes you've placed this file in your public directory
        workerInitialized = true;
      } catch (fallbackError) {
        console.error('Worker fallback failed:', fallbackError);
      }
    }
  }
}

/**
 * Simpler PDF text extraction without using PDF.js
 */
export async function SimpleTextExtract(pdfFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        // This won't give perfect results but can work for simple PDFs
        const text = reader.result as string;
        // Try to extract text content by removing PDF syntax
        const cleanedText = text
          .replace(/<<.*?>>/g, '') // Remove PDF object syntax
          .replace(/%[^\n\r]*/g, '') // Remove comments
          .replace(/\s+/g, ' ') // Normalize whitespace
          .replace(/\[.*?\]/g, '') // Remove arrays
          .replace(/\/\w+/g, '') // Remove name objects
          .trim();
        
        resolve(cleanedText);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(pdfFile);
  });
}

/**
 * Extracts text from a PDF file and splits it into chunks.
 */
export async function PdfChunk(
  pdfFile: File,
  limit: number = 4000,
  overlap: number = 1000
): Promise<string[]> {
  try {
    // Try using PDF.js first
    try {
      await initializeWorker();
      
      // Convert the File to ArrayBuffer
      const arrayBuffer = await pdfFile.arrayBuffer();
      
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      
      // Extract text from all pages
      let fullText = '';
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => 'str' in item ? item.str : '')
          .join(' ');
        
        fullText += pageText + '\n\n';
      }
      
      // Chunk the text
      return chunkText(fullText, limit, overlap);
    } catch (pdfJsError) {
      console.warn('PDF.js extraction failed, falling back to simple extraction:', pdfJsError);
      
      // Fallback to simpler extraction
      const simpleText = await SimpleTextExtract(pdfFile);
      return chunkText(simpleText, limit, overlap);
    }
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}

/**
 * Helper function to chunk text
 */
function chunkText(text: string, limit: number, overlap: number): string[] {
  const chunks: string[] = [];
  let remainingText = text.trim();
  
  while (remainingText.length > limit) {
    chunks.push(remainingText.substring(0, limit));
    remainingText = remainingText.substring(limit - overlap);
  }
  
  if (remainingText.length) {
    chunks.push(remainingText);
  }
  
  return chunks;
}