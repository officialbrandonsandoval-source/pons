-- Enable pgvector extension
create extension if not exists vector;

-- Create the 'documents' table for storing embedded content
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  project_id uuid,
  source text,
  page_content text,
  metadata jsonb,
  embedding vector(1536) -- for OpenAI Ada-002
);

-- Index for fast vector similarity search
create index on documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Full-text search index (optional)
create index on documents using gin (to_tsvector('english', page_content));

-- Create function to match documents by similarity
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  source text,
  page_content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.source,
    documents.page_content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Add RLS policies for multi-user support
alter table documents enable row level security;

create policy "Users can view their own documents"
  on documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on documents for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on documents for delete
  using (auth.uid() = user_id);

create policy "Users can update their own documents"
  on documents for update
  using (auth.uid() = user_id);
