import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '@/lib/supabase';

const ucdStages = [
  {
    id: 1,
    title: 'Планування та Дослідження',
    steps: [
      {
        id: '1.1',
        title: 'Визначення проекту',
        tasks: [
          'Цілі та завдання проекту',
          'Бізнес-вимоги',
          'Обмеження',
          'Стейкхолдери проекту',
          'Критерії успіху'
        ]
      },
      {
        id: '1.2',
        title: 'Дослідження користувачів',
        tasks: [
          'Інтервʼю з користувачами',
          'Опитування',
          'Фокус-групи',
          'Етнографічні дослідження',
          'Аналіз існуючих даних',
          'Аналіз конкурентів',
          'Аналіз трендів галузі',
          'Технологічний аудит'
        ]
      },
      {
        id: '1.3',
        title: 'Аналіз зібраних даних',
        tasks: [
          'Систематизація результатів досліджень',
          'Виявлення патернів поведінки',
          'Визначення проблем користувачів',
          'Формування інсайтів',
          'Створення карти емпатії'
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Визначення та Моделювання',
    steps: [
      {
        id: '2.1',
        title: 'Створення персон',
        tasks: [
          'Демографічні дані',
          'Цілі та мотивації',
          'Больові точки та потреби',
          'Сценарії використання',
          'Поведінкові патерни',
          'Технічні навички',
          'Контекст використання'
        ]
      },
      {
        id: '2.2',
        title: 'Користувацькі сценарії',
        tasks: [
          'Опис типових сценаріїв використання',
          'Шляхи користувача',
          'Карти взаємодії',
          'Точки контакту',
          'Емоційні стани користувача'
        ]
      }
    ]
  },
];

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: () => void;
}

export function CreateProjectDialog({ 
  open, 
  onOpenChange,
  onProjectCreated 
}: CreateProjectDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedStages, setSelectedStages] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStageToggle = (stageId: number) => {
    setSelectedStages(prev =>
      prev.includes(stageId)
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Отримуємо поточного користувача
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Користувач не авторизований');
      }

      // Створюємо новий проект
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          description: projectDescription,
          user_id: user.id
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Створюємо етапи проекту
      const stages = selectedStages.flatMap(stageId => {
        const stage = ucdStages.find(s => s.id === stageId);
        if (!stage) return [];

        return stage.steps.map(step => ({
          project_id: project.id,
          stage_id: step.id,
          name: step.title,
          status: 'pending'
        }));
      });

      if (stages.length > 0) {
        const { error: stagesError } = await supabase
          .from('project_stages')
          .insert(stages);

        if (stagesError) throw stagesError;
      }

      onProjectCreated?.();
      onOpenChange(false);
      
      // Очищаємо форму
      setProjectName('');
      setProjectDescription('');
      setSelectedStages([]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка при створенні проекту');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Створення нового проекту</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Назва проекту</label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Введіть назву проекту"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Опис проекту</label>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Опишіть ваш проект"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Етапи проекту</label>
            <div className="space-y-4">
              {ucdStages.map(stage => (
                <div key={stage.id} className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedStages.includes(stage.id)}
                      onChange={() => handleStageToggle(stage.id)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm font-medium">{stage.title}</span>
                  </label>
                  {selectedStages.includes(stage.id) && (
                    <div className="ml-6 space-y-2">
                      {stage.steps.map(step => (
                        <div key={step.id} className="space-y-1">
                          <div className="text-sm font-medium text-gray-700">{step.title}</div>
                          <ul className="ml-4 space-y-1">
                            {step.tasks.map((task, index) => (
                              <li key={index} className="text-sm text-gray-600">
                                • {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Скасувати
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!projectName.trim() || isLoading}
          >
            {isLoading ? 'Створення...' : 'Створити проект'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}