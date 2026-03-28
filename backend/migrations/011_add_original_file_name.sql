-- 添加原始文件名字段
-- 执行日期: 2026-03-28

-- 为code_attachments表添加original_file_name字段
ALTER TABLE code_attachments ADD COLUMN original_file_name TEXT;