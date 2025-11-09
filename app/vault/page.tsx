'use client'

import { useState, useCallback } from 'react'
import { documentService, DocumentMetadata } from '@/lib/documentService'

export default function VaultPage() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([])
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    await uploadFiles(files)
  }, [])

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    await uploadFiles(files)
  }

  const uploadFiles = async (files: File[]) => {
    setUploading(true)
    
    for (const file of files) {
      try {
        const metadata = await documentService.uploadDocument(file)
        setDocuments(prev => [...prev, metadata])
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
      }
    }
    
    setUploading(false)
    setDocuments(documentService.getAllDocuments())
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    try {
      const response = await fetch('/api/rag/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const handleDelete = (id: string) => {
    documentService.deleteDocument(id)
    setDocuments(documentService.getAllDocuments())
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        📚 Knowledge Vault
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Upload documents for AI-powered search and Q&A
      </p>
      
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-sky-500/10 to-cyan-500/10 border border-sky-500/20 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          💡 <strong>How it works:</strong> Upload PDFs, documents, or notes. Ask questions in the Copilot or use the search below. 
          Try saying <em>"Remember this: [your note]"</em> to quickly save information!
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-6 border-2 border-dashed transition ${
          dragActive
            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
            : 'border-gray-300 dark:border-gray-700'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Upload Documents
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Drag and drop files here, or click to browse
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.txt,.md,.json,.docx,.doc"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-medium rounded-lg cursor-pointer hover:from-sky-600 hover:to-cyan-600 transition"
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Supported: PDF, TXT, MD, JSON, DOCX
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔍 Search Documents
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ask a question about your documents..."
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition"
          >
            Search
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-3">
            {searchResults.map((result, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <p className="text-sm text-gray-900 dark:text-white mb-2">
                  {result.content}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>📄 {result.metadata.filename}</span>
                  <span>Score: {(result.score * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📚 Your Documents ({documents.length})
        </h3>
        
        {documents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No documents uploaded yet. Upload files to get started!
          </p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">
                    {doc.type === 'application/pdf' ? '📕' : '📄'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {doc.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(doc.size / 1024).toFixed(1)} KB • {doc.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      doc.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : doc.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    {doc.status}
                  </span>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
