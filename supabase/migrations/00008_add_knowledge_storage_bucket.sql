-- 创建知识库文件存储 bucket 及 RLS 策略
-- 修复 KnowledgePage 文件上传失败问题

-- 1. 创建公开存储 bucket（不限制 MIME 类型，避免旧版 .doc 等被识别为 application/octet-stream 导致上传失败）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'knowledge-files',
  'knowledge-files',
  true,
  10485760, -- 10MB
  NULL      -- 不限制 MIME 类型
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. 允许认证用户查看自己的文件
CREATE POLICY "Allow authenticated users to select own knowledge files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'knowledge-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. 允许认证用户上传自己的文件
CREATE POLICY "Allow authenticated users to insert own knowledge files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'knowledge-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. 允许认证用户更新自己的文件
CREATE POLICY "Allow authenticated users to update own knowledge files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'knowledge-files' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'knowledge-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 5. 允许认证用户删除自己的文件
CREATE POLICY "Allow authenticated users to delete own knowledge files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'knowledge-files' AND (storage.foldername(name))[1] = auth.uid()::text);
