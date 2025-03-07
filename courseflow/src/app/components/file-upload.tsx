"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload } from "lucide-react"

interface FileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
}

export default function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [invalidFileError, setInvalidFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFiles = (fileList: File[]): File[] => {
    const validFiles: File[] = []
    const invalidFiles: string[] = []

    fileList.forEach(file => {
      if (file.type === "application/pdf") {
        validFiles.push(file)
      } else {
        invalidFiles.push(file.name)
      }
    })

    if (invalidFiles.length > 0) {
      setInvalidFileError(`Invalid file type${invalidFiles.length > 1 ? 's' : ''}: ${invalidFiles.join(', ')}. Only PDF files are accepted.`)
      setTimeout(() => setInvalidFileError(null), 5000) // Clear error after 5 seconds
    }

    return validFiles
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files)
      const validFiles = validateFiles(fileArray)
      
      if (validFiles.length > 0) {
        // Append new valid files to the existing ones
        onFilesChange([...files, ...validFiles])
      }
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files)
      const validFiles = validateFiles(fileArray)
      
      if (validFiles.length > 0) {
        // Append new valid files to the existing ones
        onFilesChange([...files, ...validFiles])
      }
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? "border-violet-500 bg-violet-500/10" : "border-gray-700 hover:border-violet-500/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileInputChange} 
          multiple 
          accept="application/pdf"
        />

        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-violet-400" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-200">
              {files.length > 0 ? "Change files" : "Upload PDF files"}
            </p>
            <p className="text-sm text-gray-400">Drag and drop or click to browse</p>
            <p className="text-xs text-gray-500">Only PDF files are accepted</p>
            {files.length > 0 && (
              <p className="text-sm text-violet-400">
                {files.length} PDF file{files.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>
      </div>
      
      {invalidFileError && (
        <div className="text-red-500 text-sm mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
          {invalidFileError}
        </div>
      )}
    </div>
  )
}