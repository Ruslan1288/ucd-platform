import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

interface ProjectStatusProps {
  project: {
    start_date: string | null;
    end_date: string | null;
  };
  stages: Array<{
    progress: number;
    substages: Array<{
      completed: boolean;
    }>;
  }>;
}

export function ProjectStatus({ project, stages }: ProjectStatusProps) {
  // Розрахунок загального прогресу
  const calculateTotalProgress = () => {
    if (stages.length === 0) return 0;
    
    const totalProgress = stages.reduce((sum, stage) => sum + stage.progress, 0);
    return Math.round(totalProgress / stages.length);
  };

  // Розрахунок загальної кількості завершених підетапів
  const calculateCompletedSubstages = () => {
    let completed = 0;
    let total = 0;

    stages.forEach(stage => {
      completed += stage.substages.filter(s => s.completed).length;
      total += stage.substages.length;
    });

    return { completed, total };
  };

  const progress = calculateTotalProgress();
  const { completed, total } = calculateCompletedSubstages();

  return (
    <Card>
      <CardContent className="py-6">
        <div className="space-y-4">
          {/* Дати проекту */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              {project.start_date && format(new Date(project.start_date), 'dd.MM.yyyy')}
              {' - '}
              {project.end_date && format(new Date(project.end_date), 'dd.MM.yyyy')}
            </span>
          </div>

          {/* Прогрес */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{progress}% виконано</span>
              <span>
                {completed} з {total} підетапів завершено
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
