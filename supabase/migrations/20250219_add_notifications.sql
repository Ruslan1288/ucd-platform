-- Створюємо таблицю для сповіщень
CREATE TABLE IF NOT EXISTS public.project_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.project_stages(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deadline_week', 'deadline_three_days', 'deadline_day', 'overdue')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, stage_id, type)
);

-- Додаємо дати та прогрес до project_stages
ALTER TABLE public.project_stages
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Спочатку оновимо всі існуючі статуси на 'not_started'
UPDATE public.project_stages
SET status = 'not_started'
WHERE status = 'pending';

-- Тепер видалимо старе обмеження і додамо нове
ALTER TABLE public.project_stages 
DROP CONSTRAINT IF EXISTS project_stages_status_check;

-- Змінюємо тип і додаємо нове обмеження
ALTER TABLE public.project_stages
ALTER COLUMN status TYPE TEXT,
ALTER COLUMN status SET DEFAULT 'not_started',
ADD CONSTRAINT project_stages_status_check 
    CHECK (status IN ('not_started', 'in_progress', 'at_risk', 'overdue', 'completed'));

-- Додаємо дати до projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Оновлюємо тестові дані
UPDATE public.projects
SET 
  start_date = NOW(),
  end_date = NOW() + INTERVAL '3 months'
WHERE name = 'ініціал';

-- Оновлюємо етапи
UPDATE public.project_stages
SET 
  start_date = NOW(),
  end_date = NOW() + INTERVAL '1 month',
  status = 'in_progress',
  progress = 30
WHERE name = 'Визначення та Моделювання';

UPDATE public.project_stages
SET 
  start_date = NOW() + INTERVAL '1 month',
  end_date = NOW() + INTERVAL '2 months',
  status = 'not_started',
  progress = 0
WHERE name = 'Створення персон';

UPDATE public.project_stages
SET 
  start_date = NOW() + INTERVAL '2 months',
  end_date = NOW() + INTERVAL '3 months',
  status = 'not_started',
  progress = 0
WHERE name = 'Моделювання сценаріїв';
