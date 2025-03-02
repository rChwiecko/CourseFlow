"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"

interface FileUploadProps {
  file: File | null
  onFileChange: (file: File | null) => void
}

export default function FileUpload({ file, onFileChange }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      onFileChange(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragging ? "border-violet-500 bg-violet-500/10" : "border-gray-700 hover:border-violet-500/50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileInputChange} />

      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-violet-400" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-200">{file ? "Change file" : "Upload a file"}</p>
          <p className="text-sm text-gray-400">Drag and drop or click to browse</p>
        </div>
      </div>
    </div>
  )
}

