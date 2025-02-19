-- Створюємо розширення для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Оновлюємо таблицю projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS name text NOT NULL,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS type text DEFAULT 'website',
ADD COLUMN IF NOT EXISTS start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS client text,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Створюємо таблицю для учасників проекту
CREATE TABLE IF NOT EXISTS project_members (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Створюємо таблицю для етапів проекту
CREATE TABLE IF NOT EXISTS project_stages (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    stage_id text NOT NULL,
    name text NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Додаємо індекси
CREATE INDEX IF NOT EXISTS project_members_project_id_idx ON project_members(project_id);
CREATE INDEX IF NOT EXISTS project_members_email_idx ON project_members(email);
CREATE INDEX IF NOT EXISTS project_stages_project_id_idx ON project_stages(project_id);
