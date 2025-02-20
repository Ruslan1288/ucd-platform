import {
  Layout,
  Settings,
  Users,
  FileText,
  Layers,
  MessageSquare,
  Link2,
} from 'lucide-react';

export const BLOCK_TEMPLATES = {
  FUNCTIONAL_REQ: {
    type: 'FUNCTIONAL_REQ',
    title: 'Функціональні вимоги',
    icon: Layout,
    defaultContent: {
      description: '',
      priority: 'medium',
      category: '',
    },
  },
  NON_FUNCTIONAL_REQ: {
    type: 'NON_FUNCTIONAL_REQ',
    title: 'Нефункціональні вимоги',
    icon: Settings,
    defaultContent: {
      description: '',
      type: 'performance',
    },
  },
  USER_STORY: {
    type: 'USER_STORY',
    title: 'User Story',
    icon: Users,
    defaultContent: {
      story: '',
      acceptance: '',
      points: 0,
    },
  },
  USE_CASE: {
    type: 'USE_CASE',
    title: 'Use Case',
    icon: FileText,
    defaultContent: {
      title: '',
      actor: '',
      steps: '',
      conditions: '',
    },
  },
  CONSTRAINTS: {
    type: 'CONSTRAINTS',
    title: 'Обмеження',
    icon: Layers,
    defaultContent: {
      text: '',
      impact: 'medium',
    },
  },
  NOTES: {
    type: 'NOTES',
    title: 'Примітки',
    icon: MessageSquare,
    defaultContent: {
      text: '',
    },
  },
  DEPENDENCIES: {
    type: 'DEPENDENCIES',
    title: "Залежності",
    icon: Link2,
    defaultContent: {
      text: '',
      type: 'internal',
    },
  },
} as const;
