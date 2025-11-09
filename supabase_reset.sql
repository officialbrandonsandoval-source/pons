-- Clean up existing objects
drop policy if exists "Users can update their own documents" on documents;
drop policy if exists "Users can delete their own documents" on documents;
drop policy if exists "Users can insert their own documents" on documents;
drop policy if exists "Users can view their own documents" on documents;
drop function if exists match_documents;
drop table if exists documents;

-- Enable pgvector extension
create extension if not exists vector;

-- Create the 'documents' table with LangChain-compatible schema
create table documents (
  id uuid primary key default gen_random_uuid(),
  content text,
  metadata jsonb,
  embedding vector(1536)
);

-- Index for fast vector similarity search
create index on documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Create function to match documents by similarity (LangChain compatible)
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int default 5,
  filter jsonb default '{}'
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
