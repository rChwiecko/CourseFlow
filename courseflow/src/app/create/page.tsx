"use client"

import type React from "react"

import { useState } from "react"
import ContentContainer from "../components/content-container"
import FileUpload from "../components/file-upload"

export default function Create() {
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) return

    setIsSubmitting(true)

    // Simulate file upload
    try {
      // In a real app, you would upload the file to your server or a storage service
      await new Promise((resolve) => setTimeout(resolve, 1500))
      alert(`File "${file.name}" uploaded successfully!`)
      setFile(null)
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Failed to upload file. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ContentContainer>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-violet-400 sm:text-4xl">Create New Content</h1>

        <p className="text-gray-300">
          Upload your files to create new content. We accept various file formats including images, documents, and more.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <FileUpload file={file} onFileChange={handleFileChange} />

          {file && (
            <div className="bg-gray-900 p-4 rounded-md border border-gray-800">
              <p className="text-sm text-gray-300">
                Selected file: <span className="font-medium text-violet-300">{file.name}</span> (
                {(file.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={!file || isSubmitting}>
              {isSubmitting ? "Uploading..." : "Upload File"}
            </button>
          </div>
        </form>
      </div>
    </ContentContainer>
  )
}

