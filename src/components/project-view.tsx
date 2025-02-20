import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/lib/supabase';
import { ProjectStatus } from './project-status';
import { StageView } from './stage-view';
import { DocumentTemplate } from './document-template';
import { CanvasDocument } from './canvas-document';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProjectStage {
  id: string;
  project_id: string;
  stage_id: string;
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
  const [selectedStage, setSelectedStage] = useState<ProjectStage | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [projectStages, setProjectStages] = useState<ProjectStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>([]);

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
          progress: stage.progress || 0
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

  const handleStageClick = (stage: ProjectStage) => {
    setSelectedStage(stage);
    setActiveAccordionItems([stage.id]);
  };

  const handleBack = () => {
    setSelectedStage(null);
    setSelectedDocument(null);
  };

  return (
    <div className="h-full flex">
      {/* Основний контент */}
      <div className="flex-1 overflow-hidden">
        {selectedStage ? (
          <StageView
            projectId={project.id}
            stage={selectedStage}
            onBack={handleBack}
            onSubstageClick={(substageId) => {
              const substage = selectedStage.substages.find(s => s.id === substageId);
              if (substage) {
                setSelectedDocument(substage.name);
              }
            }}
          />
        ) : (
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
                  onClick={() => handleStageClick(stage)}
                >
                  <div className={cn(
                    "absolute top-0 right-0 w-2 h-2 rounded-full m-4",
                    getStatusColor(stage.status)
                  )} />
                  <CardHeader>
                    <CardTitle className="text-lg">{stage.name}</CardTitle>
                    <CardDescription>
                      <span className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {stage.start_date && format(new Date(stage.start_date), 'dd.MM.yyyy')}
                          {' - '}
                          {stage.end_date && format(new Date(stage.end_date), 'dd.MM.yyyy')}
                        </span>
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Progress value={stage.progress} className="h-1.5" />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{stage.progress}%</span>
                        <span>
                          {stage.substages.filter(s => s.completed).length} з {stage.substages.length} підетапів
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Правий сайдбар */}
      <div className="w-80 border-l bg-gray-50/40">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Документи проекту</h2>
          <Accordion type="single" collapsible className="w-full">
            {projectStages.map((stage) => (
              <AccordionItem key={stage.id} value={stage.id}>
                <AccordionTrigger>{stage.name}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {stage.substages?.map((substage) => (
                      <div
                        key={substage.id}
                        className={cn(
                          "flex items-center justify-between text-sm cursor-pointer hover:text-blue-500 p-2 rounded",
                          selectedDocument === substage.name && "bg-blue-50 text-blue-600"
                        )}
                        onClick={() => setSelectedDocument(substage.name)}
                      >
                        <span>{substage.name}</span>
                        <span className="text-xs text-gray-500">
                          {substage.completed ? '✓' : 'В процесі'}
                        </span>
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
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          {selectedDocument === 'Аналіз вимог' ? (
            <CanvasDocument
              projectId={project.id}
              stageId={selectedStage?.id || ''}
              documentId={selectedDocument}
              onBack={() => setSelectedDocument(null)}
              onNext={() => setSelectedDocument(null)}
            />
          ) : (
            <DocumentTemplate
              projectId={project.id}
              stageId={selectedStage?.id || ''}
              documentId={selectedDocument}
              onBack={() => setSelectedDocument(null)}
              onNext={() => setSelectedDocument(null)}
            />
          )}
        </div>
      )}
    </div>
  );
};
