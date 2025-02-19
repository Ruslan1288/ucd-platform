import React from 'react';
import { Button } from './ui/button';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';

interface StageViewProps {
  projectId: string;
  stage: {
    id: string;
    name: string;
    progress: number;
    status: string;
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

export const StageView: React.FC<StageViewProps> = ({
  stage,
  onBack,
  onSubstageClick
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 space-y-6">
        {/* Заголовок */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Назад до проекту
          </Button>
          <h1 className="text-2xl font-semibold">{stage.name}</h1>
        </div>

        {/* Прогрес етапу */}
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <div className="text-sm font-medium">Прогрес етапу</div>
              <Progress value={stage.progress} className="h-2" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{stage.progress}%</span>
                <span>
                  {stage.substages.filter(s => s.completed).length} з {stage.substages.length} підетапів завершено
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Картки підетапів */}
        <div className="grid grid-cols-1 gap-4">
          {stage.substages.map((substage) => (
            <Card 
              key={substage.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSubstageClick(substage.id)}
            >
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    substage.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm font-medium">{substage.name}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {substage.completed ? 'Завершено' : 'В процесі'}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
