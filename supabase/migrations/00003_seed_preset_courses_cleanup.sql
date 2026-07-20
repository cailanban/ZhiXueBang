-- 预设课程种子数据（自动生成）
-- 先清理旧的预设数据（保留用户自建数据）
DELETE FROM questions WHERE course_id IN (SELECT id FROM courses WHERE created_by IS NULL);
DELETE FROM chapters WHERE course_id IN (SELECT id FROM courses WHERE created_by IS NULL);
DELETE FROM courses WHERE created_by IS NULL;