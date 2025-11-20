-- Create storage bucket for orchestrator files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'orchestrator-files',
  'orchestrator-files',
  true,
  10485760, -- 10MB limit
  ARRAY['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
);

-- Create RLS policies for orchestrator files bucket
CREATE POLICY "Anyone can view orchestrator files"
ON storage.objects FOR SELECT
USING (bucket_id = 'orchestrator-files');

CREATE POLICY "Authenticated users can upload orchestrator files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'orchestrator-files' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own orchestrator files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'orchestrator-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own orchestrator files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'orchestrator-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);