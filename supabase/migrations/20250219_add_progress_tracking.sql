-- Додаємо поле для відстеження прогресу в project_stages
ALTER TABLE project_stages
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'not_started'
  CHECK (status IN ('not_started', 'in_progress', 'at_risk', 'overdue', 'completed')),
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Створюємо таблицю для сповіщень
CREATE TABLE IF NOT EXISTS project_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES project_stages(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deadline_week', 'deadline_three_days', 'deadline_day', 'overdue')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, stage_id, type)
);
