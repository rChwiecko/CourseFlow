"use client";

import type React from "react";
import { useState } from "react";
import ContentContainer from "../components/content-container";
import FileUpload from "../components/file-upload";
import { Trash2, FileText } from "lucide-react";
import { PdfChunk } from "../functions/pdfreader";

// Define an interface for processed files
interface ProcessedFile {
  name: string;
  chunks: string[];
}

export default function Create() {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [chunkSize, setChunkSize] = useState<number>(4000);
  const [overlapSize, setOverlapSize] = useState<number>(1000);
  const [processingStatus, setProcessingStatus] = useState<string>("");

  const handleFilesChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    // Reset processed files when new files are selected
    setProcessedFiles([]);
  };

  const handleDeleteFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    // Reset processed files when files are deleted
    setProcessedFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) return;

    setIsSubmitting(true);
    setProcessedFiles([]);

    try {
      const results = [];

      // Process each file one by one using the imported PdfChunk function
      for (const file of files) {
        try {
          setProcessingStatus(`Processing ${file.name}...`);
          
          // Use the imported PdfChunk function
          const chunks = await PdfChunk(file, chunkSize, overlapSize);
          
          results.push({
            fileName: file.name,
            chunks,
            totalChunks: chunks.length
          });
          
          console.log(`Processed ${file.name}: ${chunks.length} chunks created\nContent: ${chunks.join("\n")}`);
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          // Continue with other files even if one fails
        }
      }

      // Update state with the processed results
      setProcessedFiles(
        results.map((result) => ({
          name: result.fileName,
          chunks: result.chunks,
        }))
      );

      // Display success message
      const totalProcessedFiles = results.length;
      const totalChunks = results.reduce(
        (sum, file) => sum + file.totalChunks,
        0
      );

      if (totalProcessedFiles > 0) {
        alert(
          `Processing complete! Created ${totalChunks} chunks from ${totalProcessedFiles} PDF file(s).`
        );
      } else {
        alert(
          "No files were successfully processed. Please check the console for errors."
        );
      }
    } catch (error) {
      console.error("Error processing files:", error);
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

        {/* Display processed results */}
        {processedFiles.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold text-violet-400">
              Processing Results
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