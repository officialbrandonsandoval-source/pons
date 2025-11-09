# 🧠 RAG System Documentation

## Overview
PONS now includes a **Retrieval-Augmented Generation (RAG)** system that allows your AI to answer questions based on uploaded documents.

## What is RAG?
RAG combines:
1. **Vector Search** - Find relevant document chunks using semantic similarity
2. **AI Generation** - Use retrieved context to generate accurate answers
3. **Source Attribution** - Show which documents were used

## Features

### ✅ Implemented
- **Document Upload** - Drag & drop interface in Vault
- **Smart Chunking** - Automatic text splitting for optimal retrieval
- **Vector Embeddings** - OpenAI embeddings for semantic search
- **Similarity Search** - Find relevant passages across all documents
- **AI Q&A** - Ask questions, get answers with sources
- **Supported Formats** - PDF, TXT, MD, JSON

### 🚀 Coming Soon
- DOCX, XLSX support
- Image OCR extraction
- Audio transcription
- Real-time collaboration

## Setup

### 1. Create Supabase Project
```bash
# Go to https://supabase.com
# Create a new project
# Note your project URL and service role key
```

### 2. Run SQL Setup
```sql
# Copy contents of supabase_setup.sql
# Run in Supabase SQL Editor
# This creates:
# - pgvector extension
# - documents table
# - match_documents function
# - Similarity search index
```

### 3. Configure Environment
```bash
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Restart Server
```bash
pnpm dev
```

## Usage

### Upload Documents

1. **Navigate to Vault** (`/vault`)
2. **Drag & Drop** files or click "Choose Files"
3. **Wait for Processing** - Status shows when complete
4. **Documents are Ready** - Now searchable via AI

### Ask Questions

#### Method 1: Vault Search
1. Go to Vault page
2. Type question in search box
3. Get relevant passages with similarity scores

#### Method 2: Copilot Chat
1. Go to Copilot (`/copilot`)
2. Ask questions like:
   - "What does my contract say about termination?"
   - "Summarize the uploaded proposal"
   - "Find information about pricing in my documents"

### Trigger Phrases
RAG automatically activates when you mention:
- "document"
- "uploaded"
- "in my files"
- "knowledge base"

Example:
```
User: "What does the document say about refunds?"
AI: [Retrieves relevant chunks and answers with sources]
```

## Technical Architecture

### Document Ingestion Flow
```
1. User uploads file
   ↓
2. Extract text (PDF/TXT/MD/JSON)
   ↓
3. Split into chunks (1000 chars, 200 overlap)
   ↓
4. Generate embeddings (OpenAI)
   ↓
5. Store in Supabase vector DB
```

### Query Flow
```
1. User asks question
   ↓
2. Generate query embedding
   ↓
3. Similarity search (top 4 chunks)
   ↓
4. Format context
   ↓
5. Send to GPT-4 with context
   ↓
6. Return answer + sources
```

### Components

**ragAgent.ts** - Core RAG logic
- `initializeRAG()` - Setup vector store
- `ingestDocument()` - Process and store documents
- `ragQuery()` - Query with AI answer generation
- `searchDocuments()` - Similarity search only
- `deleteDocument()` - Remove from vector DB

**documentService.ts** - File handling
- Upload management
- Text extraction (PDF, TXT, MD, JSON)
- Status tracking
- Metadata storage

**vault/page.tsx** - UI
- Drag & drop upload
- Document list
- Search interface
- Results display

## Configuration

### Chunk Size
```typescript
// In ragAgent.ts
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,      // Increase for longer context
  chunkOverlap: 200,    // Increase to avoid splitting related content
})
```

### Retrieval Count
```typescript
// In ragAgent.ts ragQuery()
const { maxResults = 4 } = options  // Retrieve top 4 chunks
```

### Similarity Threshold
```sql
-- In supabase_setup.sql match_documents()
match_threshold float default 0.7  -- Minimum similarity (0-1)
```

## Supported File Types

| Format | Extension | Status |
|--------|-----------|--------|
| PDF | `.pdf` | ✅ |
| Text | `.txt` | ✅ |
| Markdown | `.md` | ✅ |
| JSON | `.json` | ✅ |
| Word | `.docx` | 🔜 |
| Excel | `.xlsx` | 🔜 |
| Images | `.jpg/.png` | 🔜 |

## Best Practices

### Document Preparation
1. **Clean formatting** - Remove headers/footers
2. **Logical structure** - Use headings and sections
3. **Meaningful filenames** - Helps with organization
4. **Remove duplicates** - Avoid confusion

### Query Tips
1. **Be specific** - "What's the refund policy?" vs "Tell me about refunds"
2. **Mention documents** - Triggers RAG mode
3. **Follow up** - Ask clarifying questions
4. **Check sources** - Verify which documents were used

### Performance
- **Limit file size** - Keep under 10MB per file
- **Batch uploads** - Upload multiple files at once
- **Regular cleanup** - Delete unused documents
- **Monitor storage** - Supabase free tier has limits

## Troubleshooting

### "RAG system not configured"
**Solution:** Add Supabase credentials to `.env.local`

### Upload fails
**Possible causes:**
- File too large (>10MB)
- Unsupported format
- PDF is image-based (needs OCR)

### No search results
**Possible causes:**
- Query too specific
- Documents haven't finished processing
- Similarity threshold too high

### Slow performance
**Solutions:**
- Reduce chunk size
- Lower maxResults
- Add indexes in Supabase
- Upgrade Supabase plan

## API Reference

### ingestDocument()
```typescript
await ingestDocument(content: string, metadata: {
  filename: string
  type: string
  uploadedAt: Date
  userId?: string
})
```

### ragQuery()
```typescript
const { answer, sources } = await ragQuery(
  query: string,
  options?: {
    maxResults?: number      // Default: 4
    filter?: Record<string, any>
  }
)
```

### searchDocuments()
```typescript
const results = await searchDocuments(
  query: string,
  maxResults?: number       // Default: 10
)
```

## Cost Estimates

### OpenAI Embeddings
- **Model:** text-embedding-ada-002
- **Cost:** $0.0001 per 1K tokens
- **Example:** 100 pages ≈ $0.05

### Supabase Storage
- **Free tier:** 500MB database + 1GB bandwidth
- **Pro tier:** $25/mo (8GB database + 50GB bandwidth)

### GPT-4 Usage
- **Per query:** ~$0.03 (4 chunks context)
- **Monthly (100 queries):** ~$3

## Security

### Data Privacy
- Documents stored in your Supabase instance
- Not sent to OpenAI (only embeddings)
- Row-Level Security (RLS) supported

### Access Control
```sql
-- Already configured in supabase_setup.sql
-- Users can only access their own documents
```

### Encryption
- Supabase encrypts at rest
- HTTPS for all connections
- API keys never exposed to client

## Roadmap

### Q1 2025
- [ ] DOCX/XLSX support
- [ ] Image OCR
- [ ] Batch delete
- [ ] Export search results

### Q2 2025
- [ ] Audio transcription
- [ ] Video analysis
- [ ] Real-time collaboration
- [ ] Version history

### Future
- [ ] Multi-language support
- [ ] Custom embedding models
- [ ] Graph-based retrieval
- [ ] Hybrid search (keyword + semantic)

---

**Questions?** Check the main README or create an issue on GitHub.
