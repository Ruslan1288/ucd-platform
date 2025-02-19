import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { uk } from 'date-fns/locale';

interface TimelineStage {
  id: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'at_risk' | 'overdue' | 'completed';
  start_date: string | null;
  end_date: string | null;
}

interface ProjectTimelineProps {
  project: {
    start_date: string | null;
    end_date: string | null;
  };
  stages: TimelineStage[];
}

const getStatusColor = (status: TimelineStage['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'at_risk':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'overdue':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusText = (status: TimelineStage['status']) => {
  switch (status) {
    case 'completed':
      return 'Завершено';
    case 'in_progress':
      return 'В процесі';
    case 'at_risk':
      return 'Ризик зриву';
    case 'overdue':
      return 'Прострочено';
    default:
      return 'Не розпочато';
  }
};

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project, stages }) => {
  const today = new Date();

  const getDaysLeft = (endDate: string | null) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  if (!project.start_date || !project.end_date) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Часова шкала проекту</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            Дати проекту не встановлені
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Часова шкала проекту</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Загальний термін проекту */}
          <div className="flex justify-between text-sm text-gray-500">
            <div>
              Початок: {format(new Date(project.start_date), 'd MMMM yyyy', { locale: uk })}
            </div>
            <div>
              Кінець: {format(new Date(project.end_date), 'd MMMM yyyy', { locale: uk })}
            </div>
          </div>

          {/* Етапи на часовій шкалі */}
          <div className="relative space-y-4">
            {stages.map((stage) => {
              if (!stage.start_date || !stage.end_date) return null;
              
              const daysLeft = getDaysLeft(stage.end_date);
              const isUpcoming = isBefore(today, new Date(stage.start_date));
              const isActive = isBefore(today, new Date(stage.end_date)) && 
                             isAfter(today, new Date(stage.start_date));

              return (
                <div key={stage.id} className="relative pl-6 pb-4">
                  {/* Вертикальна лінія */}
                  <div className="absolute left-2 top-2 -bottom-2 w-px bg-gray-200" />
                  
                  {/* Точка на лінії */}
                  <div className={`absolute left-0 top-2 w-4 h-4 rounded-full border-2 
                    ${getStatusColor(stage.status)}`} />
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stage.name}</span>
                      <Badge variant="outline" className={getStatusColor(stage.status)}>
                        {getStatusText(stage.status)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {format(new Date(stage.start_date), 'd MMM', { locale: uk })} - {format(new Date(stage.end_date), 'd MMM', { locale: uk })}
                    </div>
                    
                    {isActive && daysLeft > 0 && (
                      <div className="text-sm font-medium text-blue-600">
                        Залишилось {daysLeft} днів
                      </div>
                    )}
                    {isUpcoming && (
                      <div className="text-sm text-gray-500">
                        Початок через {Math.abs(getDaysLeft(stage.start_date))} днів
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
