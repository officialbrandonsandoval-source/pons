export interface DocumentMetadata {
  id: string
  filename: string
  type: string
  size: number
  uploadedAt: Date
  status: 'processing' | 'completed' | 'failed'
  error?: string
}

export class DocumentService {
  private documents: Map<string, DocumentMetadata> = new Map()

  async uploadDocument(file: File): Promise<DocumentMetadata> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const metadata: DocumentMetadata = {
      id,
      filename: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
      status: 'processing',
    }

    this.documents.set(id, metadata)

    try {
      // Extract text from file
      const text = await this.extractText(file)

      // Ingest into vector store via API
      const response = await fetch('/api/rag/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          metadata: {
            filename: file.name,
            type: file.type,
            uploadedAt: new Date(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to ingest document')
      }

      metadata.status = 'completed'
      this.documents.set(id, metadata)
    } catch (error) {
      metadata.status = 'failed'
      metadata.error = error instanceof Error ? error.message : 'Unknown error'
      this.documents.set(id, metadata)
      throw error
    }

    return metadata
  }

  private async extractText(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()

    switch (file.type) {
      case 'application/pdf':
        throw new Error('PDF support coming soon. Please use TXT, MD, or JSON files for now.')
      
      case 'text/plain':
      case 'text/markdown':
        return await this.extractPlainText(buffer)
      
      case 'application/json':
        return await this.extractJSONText(buffer)
      
      default:
        throw new Error(`Unsupported file type: ${file.type}`)
    }
  }

  private async extractPlainText(buffer: ArrayBuffer): Promise<string> {
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(buffer)
  }

  private async extractJSONText(buffer: ArrayBuffer): Promise<string> {
    const decoder = new TextDecoder('utf-8')
    const jsonText = decoder.decode(buffer)
    const json = JSON.parse(jsonText)
    return JSON.stringify(json, null, 2)
  }

  getDocument(id: string): DocumentMetadata | undefined {
    return this.documents.get(id)
  }

  getAllDocuments(): DocumentMetadata[] {
    return Array.from(this.documents.values())
  }

  deleteDocument(id: string): void {
    this.documents.delete(id)
  }
}

export const documentService = new DocumentService()
