import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/lib/supabase';
import { ProjectStatus } from './project-status';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectStage {
  id: string;
  name: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'at_risk' | 'overdue' | 'completed';
  start_date: string | null;
  end_date: string | null;
  substages: any[];
}

interface ProjectViewProps {
  project: {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
  };
  onBack: () => void;
}

const getStatusColor = (status: string) => {
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
      return 'bg-gray-500';
  }
};

export const ProjectView: React.FC<ProjectViewProps> = ({ project, onBack }) => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [projectStages, setProjectStages] = useState<ProjectStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectStages = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('project_stages')
          .select('*')
          .eq('project_id', project.id);

        if (error) {
          console.error('Помилка при завантаженні етапів:', error);
          return;
        }
        
        const parsedStages = (data || []).map(stage => ({
          ...stage,
          substages: stage.substages ? JSON.parse(stage.substages) : [],
          progress: stage.progress || 0,
          status: stage.status || 'not_started'
        }));
        
        setProjectStages(parsedStages);
      } catch (error) {
        console.error('Помилка при завантаженні етапів:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectStages();
  }, [project.id]);

  return (
    <div className="h-full flex">
      {/* Основний контент */}
      <div className="flex-1 overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Заголовок */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Назад до проектів
            </Button>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
          </div>

          {/* Загальний прогрес */}
          <ProjectStatus project={project} stages={projectStages} />

          {/* Картки етапів */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectStages.map((stage) => (
              <Card 
                key={stage.id} 
                className="relative cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedDocument(stage.substages[0]?.name)}
              >
                <div className={cn(
                  "absolute top-0 right-0 w-2 h-2 rounded-full m-4",
                  getStatusColor(stage.status)
                )} />
                <CardHeader>
                  <CardTitle className="text-lg">{stage.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {stage.start_date && format(new Date(stage.start_date), 'dd.MM.yyyy')}
                        {' - '}
                        {stage.end_date && format(new Date(stage.end_date), 'dd.MM.yyyy')}
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500">
                    {stage.substages.length} {stage.substages.length === 1 ? 'підетап' : 'підетапів'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Правий сайдбар */}
      <div className="w-80 border-l bg-gray-50/40">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Документи проекту</h2>
          <Accordion type="single" collapsible>
            {projectStages.map((stage) => (
              <AccordionItem key={stage.id} value={stage.id}>
                <AccordionTrigger>{stage.name}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-4">
                    {stage.substages?.map((substage: any, index: number) => (
                      <div
                        key={index}
                        className="text-sm cursor-pointer hover:text-blue-500"
                        onClick={() => setSelectedDocument(substage.name)}
                      >
                        {substage.name}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Модальне вікно документа */}
      {selectedDocument && (
        <Card className="fixed inset-6 z-50 bg-white overflow-auto">
          <CardHeader className="sticky top-0 bg-white border-b z-10">
            <div className="flex items-center justify-between">
              <CardTitle>{selectedDocument}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDocument(null)}>
                <ChevronLeft className="w-4 h-4" />
                Назад
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose max-w-none">
              <p className="text-gray-500">
                Тут буде вміст документу "{selectedDocument}"
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
