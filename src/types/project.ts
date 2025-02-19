export type ProjectType = 'website' | 'mobile' | 'desktop' | 'other';

export type ProjectRole = 'designer' | 'researcher' | 'manager' | 'developer' | 'other';

export type ProjectPriority = 'low' | 'medium' | 'high';

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: ProjectRole;
}

export interface ProjectStage {
  id: string;
  title: string;
  isSelected: boolean;
}

export interface NewProject {
  // Основна інформація
  name: string;
  description: string;
  type: ProjectType;
  startDate: string;
  endDate: string;

  // Команда та організація
  members: ProjectMember[];
  client: string;
  priority: ProjectPriority;

  // Етапи
  selectedStages: string[];
}

export const PROJECT_STAGES: ProjectStage[] = [
  {
    id: '1',
    title: 'Планування та Дослідження',
    isSelected: false
  },
  {
    id: '2',
    title: 'Визначення та Моделювання',
    isSelected: false
  },
  {
    id: '3',
    title: 'Проектування',
    isSelected: false
  },
  {
    id: '4',
    title: 'Тестування та Валідація',
    isSelected: false
  },
  {
    id: '5',
    title: 'Впровадження та Моніторинг',
    isSelected: false
  },
  {
    id: '6',
    title: 'Документація та Артефакти',
    isSelected: false
  }
];

export const PROJECT_TYPES = [
  { id: 'website', label: 'Веб-сайт' },
  { id: 'mobile', label: 'Мобільний додаток' },
  { id: 'desktop', label: 'Десктоп додаток' },
  { id: 'other', label: 'Інше' }
];

export const PROJECT_ROLES = [
  { id: 'designer', label: 'Дизайнер' },
  { id: 'researcher', label: 'Дослідник' },
  { id: 'manager', label: 'Менеджер' },
  { id: 'developer', label: 'Розробник' },
  { id: 'other', label: 'Інше' }
];

export const PROJECT_PRIORITIES = [
  { id: 'low', label: 'Низький' },
  { id: 'medium', label: 'Середній' },
  { id: 'high', label: 'Високий' }
];
