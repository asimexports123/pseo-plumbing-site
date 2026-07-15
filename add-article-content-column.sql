-- Migration to add article_content column to existing cities_data table
-- Run this in your Supabase SQL Editor

ALTER TABLE cities_data 
ADD COLUMN IF NOT EXISTS article_content TEXT;
