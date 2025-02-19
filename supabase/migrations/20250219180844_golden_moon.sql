/*
  # Створення таблиць для проектів та етапів UCD

  1. Нові таблиці
    - `projects`
      - `id` (uuid, первинний ключ)
      - `name` (текст, назва проекту)
      - `description` (текст, опис проекту)
      - `created_at` (timestamp, дата створення)
      - `updated_at` (timestamp, дата оновлення)
      - `user_id` (uuid, зовнішній ключ до auth.users)

    - `project_stages`
      - `id` (uuid, первинний ключ)
      - `project_id` (uuid, зовнішній ключ до projects)
      - `stage_id` (текст, ідентифікатор етапу)
      - `name` (текст, назва етапу)
      - `status` (текст, статус етапу)
      - `created_at` (timestamp, дата створення)
      - `updated_at` (timestamp, дата оновлення)

  2. Безпека
    - Увімкнено RLS для обох таблиць
    - Додано політики для автентифікованих користувачів
*/

-- Створення таблиці проектів
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Створення таблиці етапів проекту
CREATE TABLE IF NOT EXISTS project_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  stage_id text NOT NULL,
  name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Увімкнення RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stages ENABLE ROW LEVEL SECURITY;

-- Політики для проектів
CREATE POLICY "Users can create their own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Політики для етапів проекту
CREATE POLICY "Users can create stages for their projects"
  ON project_stages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view stages of their projects"
  ON project_stages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stages of their projects"
  ON project_stages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stages of their projects"
  ON project_stages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

-- Тригер для оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_stages_updated_at
  BEFORE UPDATE ON project_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();