import React from 'react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

interface ProjectStage {
  id: string;
  name: string;
  progress: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

interface ProjectStatusProps {
  project: {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
  };
  stages: ProjectStage[];
}

export const ProjectStatus: React.FC<ProjectStatusProps> = ({ project, stages }) => {
  const totalProgress = stages.length
    ? stages.reduce((acc, stage) => acc + stage.progress, 0) / stages.length
    : 0;

  return (
    <Card>
      <CardContent className="py-6">
        <div className="space-y-4">
          <div className="text-sm font-medium">Загальний прогрес</div>
          <Progress value={totalProgress} className="h-2" />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{Math.round(totalProgress)}%</span>
            <span>
              {project.start_date && project.end_date && (
                <>
                  {format(new Date(project.start_date), 'd MMM', { locale: uk })} - {format(new Date(project.end_date), 'd MMM yyyy', { locale: uk })}
                </>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
