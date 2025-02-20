import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface StageViewProps {
  projectId: string;
  stage: {
    id: string;
    name: string;
    status: string;
    progress: number;
    start_date: string | null;
    end_date: string | null;
    substages: Array<{
      id: string;
      name: string;
      completed: boolean;
    }>;
  };
  onBack: () => void;
  onSubstageClick: (substageId: string) => void;
}

export function StageView({ projectId, stage, onBack, onSubstageClick }: StageViewProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Назад до проекту
        </Button>
        <h1 className="text-2xl font-semibold">{stage.name}</h1>
      </div>

      {/* Інформація про етап */}
      <Card>
        <CardContent className="py-6">
          <div className="space-y-4">
            {/* Дати */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>
                {stage.start_date && format(new Date(stage.start_date), 'dd.MM.yyyy')}
                {' - '}
                {stage.end_date && format(new Date(stage.end_date), 'dd.MM.yyyy')}
              </span>
            </div>

            {/* Прогрес */}
            <div className="space-y-2">
              <Progress value={stage.progress} className="h-2" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{stage.progress}% виконано</span>
                <span>
                  {stage.substages.filter(s => s.completed).length} з {stage.substages.length} підетапів завершено
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Підетапи */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stage.substages.map((substage) => (
          <Card 
            key={substage.id}
            className={cn(
              "cursor-pointer hover:shadow-md transition-shadow",
              substage.completed && "bg-green-50"
            )}
            onClick={() => onSubstageClick(substage.id)}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {substage.completed && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                <span>{substage.name}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
