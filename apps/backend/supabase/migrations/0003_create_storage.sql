-- ===========================================
-- Migration: Create Storage Bucket for Job Images
-- ===========================================

-- Create the job-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'job-images',
    'job-images',
    true, -- Public bucket for easy image access
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
-- Note: This is usually already enabled, but we ensure it here

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload own images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'job-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Users can view their own images
CREATE POLICY "Users can view own images"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'job-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Public can view all images (since bucket is public)
CREATE POLICY "Public can view all job images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'job-images');

-- Policy: Users can update their own images
CREATE POLICY "Users can update own images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'job-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'job-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
