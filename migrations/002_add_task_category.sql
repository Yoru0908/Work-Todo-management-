-- Migration: Add category and content fields to tasks
-- Run with: wrangler d1 execute warehouse-tasks --local --file=migrations/002_add_task_category.sql

-- Add category field to distinguish task vs guide
ALTER TABLE tasks ADD COLUMN category TEXT DEFAULT 'task';

-- Add content field for guide detailed content
ALTER TABLE tasks ADD COLUMN content TEXT;
