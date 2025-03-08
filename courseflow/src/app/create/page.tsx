"use client";

import type React from "react";
import { useState } from "react";
import ContentContainer from "../components/content-container";
import FileUpload from "../components/file-upload";
import { Trash2, FileText } from "lucide-react";
import { PdfChunk } from "../functions/pdfreader";
import { useSession } from "next-auth/react";

// Define interfaces for data structures
interface ProcessedFile {
  name: string;
  chunks: string[];
}

interface ExtractedEvents {
  fileName: string;
  events: string; // The raw events data from /api/skim
}

export default function Create() {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [chunkSize, setChunkSize] = useState<number>(4000);
  const [overlapSize, setOverlapSize] = useState<number>(1000);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [formattedResult, setFormattedResult] = useState<string>("");

  const handleFilesChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    // Reset processed files when new files are selected
    setProcessedFiles([]);
    setFormattedResult("");
  };

  const handleDeleteFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    // Reset processed files when files are deleted
    setProcessedFiles([]);
    setFormattedResult("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) return;

    setIsSubmitting(true);
    setProcessedFiles([]);
    setFormattedResult("");

    try {
      const extractedEvents: ExtractedEvents[] = [];
      const chunkResults: ProcessedFile[] = [];

      // Process each file one by one
      for (const file of files) {
        try {
          // Step 1: Read through PDF with function
          setProcessingStatus(`Processing ${file.name}...`);
          const chunks = await PdfChunk(file, chunkSize, overlapSize);
          
          // Store chunk results for UI display
          chunkResults.push({
            name: file.name,
            chunks
          });

          // Step 2: Pass the scanned PDF through a request to the /api/skim endpoint
          setProcessingStatus(`Extracting events from ${file.name}...`);
          const skimResponse = await fetch("/api/skim", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: chunks.join("\n") }),
          });

          if (!skimResponse.ok) {
            throw new Error(`HTTP error! status: ${skimResponse.status}`);
          }

          const skimData = await skimResponse.json();
          console.log(`Events extracted from ${file.name}:`, skimData);

          // Step 3: Store the result in data structure
          extractedEvents.push({
            fileName: file.name,
            events: skimData.result
          });

        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          // Continue with other files even if one fails
        }
      }

      if (extractedEvents.length > 0) {
        setProcessingStatus("Formatting final results...");
        
        try {
          // Combine all extracted event texts into a single string
          const combinedEventText = extractedEvents
            .map(item => `File: ${item.fileName}\n${item.events}`)
            .join("\n\n");
          
          const formatResponse = await fetch("/api/format", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            // The format endpoint expects { text: string }, not { extractedEvents: array }
            body: JSON.stringify({ text: combinedEventText }),
          });

          if (!formatResponse.ok) {
            const errorText = await formatResponse.text();
            console.error("Format API error response:", errorText);
            throw new Error(`HTTP error! status: ${formatResponse.status}`);
          }

          const formatData = await formatResponse.json();
          console.log("Final formatted result:", formatData);
          
          // Store the formatted result for display
          setFormattedResult(formatData.result || JSON.stringify(formatData, null, 2));
          
        } catch (formatError) {
          console.error("Error formatting results:", formatError);
        }
      } 

      setProcessedFiles(chunkResults);

      // Display success message
      if (chunkResults.length > 0) {
        const totalChunks = chunkResults.reduce(
          (sum, file) => sum + file.chunks.length,
          0
        );
        
        alert(
          `Processing complete! Created ${totalChunks} chunks from ${chunkResults.length} PDF file(s).`
        );
      } else {
        alert(
          "No files were successfully processed. Please check the console for errors."
        );
      }
    } catch (error) {
      console.error("Error in overall processing:", error);
      alert(
        error instanceof Error ? error.message : "Failed to process files."
      );
    } finally {
      setIsSubmitting(false);
      setProcessingStatus("");
    }
  };

  return (
    <ContentContainer>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-violet-400 sm:text-4xl">
          Create New Content
        </h1>

        <p className="text-gray-300">
          Upload your PDF files to create new content. Only PDF files are
          accepted.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <FileUpload files={files} onFilesChange={handleFilesChange} />

          {/* Add chunk size controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="chunkSize"
                className="block text-sm text-gray-300"
              >
                Chunk Size (characters)
              </label>
              <input
                id="chunkSize"
                type="number"
                min="500"
                max="10000"
                value={chunkSize}
                onChange={(e) => setChunkSize(parseInt(e.target.value) || 4000)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="overlapSize"
                className="block text-sm text-gray-300"
              >
                Overlap Size (characters)
              </label>
              <input
                id="overlapSize"
                type="number"
                min="0"
                max={chunkSize / 2}
                value={overlapSize}
                onChange={(e) =>
                  setOverlapSize(parseInt(e.target.value) || 1000)
                }
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-200"
              />
            </div>
          </div>

          {files.length > 0 && (
            <div className="bg-gray-900 p-4 rounded-md border border-gray-800">
              <p className="text-sm text-gray-300 mb-2">
                Selected PDF files:{" "}
                <span className="font-medium text-violet-300">
                  {files.length}
                </span>
              </p>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-300 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-violet-300 mr-2" />
                      <span className="text-violet-300">{file.name}</span>{" "}
                      <span className="text-gray-400 ml-1">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {processingStatus && (
            <div className="bg-violet-900/20 p-3 rounded border border-violet-500/30 text-violet-300">
              {processingStatus}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={files.length === 0 || isSubmitting}
            >
              {isSubmitting
                ? "Processing..."
                : `Process ${files.length > 0 ? files.length : ""} PDF File${
                    files.length !== 1 ? "s" : ""
                  }`}
            </button>
          </div>
        </form>

        {/* Display formatted results if available */}
        {formattedResult && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold text-violet-400">
              Formatted Results
            </h2>
            <div className="bg-gray-900 p-4 rounded-md border border-gray-800">
              <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                {formattedResult}
              </pre>
            </div>
          </div>
        )}

        {/* Display processed chunks */}
        {processedFiles.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold text-violet-400">
              PDF Chunks
            </h2>

            <div className="space-y-4">
              {processedFiles.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  className="bg-gray-900 p-4 rounded-md border border-gray-800"
                >
                  <h3 className="text-lg font-semibold text-violet-300 mb-2">
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Created {file.chunks.length} chunks
                  </p>

                  <div className="space-y-2">
                    {file.chunks.slice(0, 3).map((chunk, chunkIndex) => (
                      <div
                        key={chunkIndex}
                        className="bg-gray-800 p-3 rounded text-sm text-gray-300"
                      >
                        <p className="font-medium text-gray-200 mb-1">
                          Chunk {chunkIndex + 1}:
                        </p>
                        <p className="line-clamp-3">
                          {chunk.substring(0, 150)}...
                        </p>
                      </div>
                    ))}

                    {file.chunks.length > 3 && (
                      <p className="text-xs text-gray-400 italic">
                        + {file.chunks.length - 3} more chunks not shown
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ContentContainer>
  );
}