-- 创建 generated-content 存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('generated-content', 'generated-content', true, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 52428800;

CREATE POLICY "Allow authenticated users to select own generated content" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'generated-content' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow authenticated users to insert own generated content" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'generated-content' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow authenticated users to delete own generated content" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'generated-content' AND (storage.foldername(name))[1] = auth.uid()::text);
