import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface ProjectStage {
  id: string;
  name: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'at_risk' | 'overdue' | 'completed';
  start_date: string;
  end_date: string;
}

interface ProjectProgressProps {
  project: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  };
  stages: ProjectStage[];
}

const getStatusColor = (status: ProjectStage['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'in_progress':
      return 'bg-blue-500';
    case 'at_risk':
      return 'bg-yellow-500';
    case 'overdue':
      return 'bg-red-500';
    default:
      return 'bg-gray-300';
  }
};

const getStatusIcon = (status: ProjectStage['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'at_risk':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'overdue':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

export const ProjectProgress: React.FC<ProjectProgressProps> = ({ project, stages }) => {
  // Розрахунок загального прогресу проекту
  const totalProgress = stages.length
    ? stages.reduce((acc, stage) => acc + stage.progress, 0) / stages.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Прогрес проекту</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Загальний прогрес */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Загальний прогрес</span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>

          {/* Прогрес по етапах */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Етапи проекту</h4>
            {stages.map((stage) => (
              <div key={stage.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(stage.status)}
                    <span>{stage.name}</span>
                  </div>
                  <span>{stage.progress}%</span>
                </div>
                <Progress 
                  value={stage.progress} 
                  className={`h-2 ${getStatusColor(stage.status)}`} 
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
