import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, Circle, CheckCircle } from 'lucide-react';
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

            {/* Прогрес */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium mb-4">Прогрес етапу</h2>
                <Progress value={0} className="h-2 mb-2" />
                <p className="text-sm text-gray-500">
                  0% • 0 з 4 підетапів завершено
                </p>
              </CardContent>
            </Card>

            {/* Список підетапів */}
            <div className="space-y-2">
              {projectStages.map((stage) => (
                stage.substages.map((substage) => (
                  <div
                    key={substage.id}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedDocument(substage.name)}
                  >
                    {substage.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{substage.name}</h3>
                      <p className="text-sm text-gray-500">
                        {substage.completed ? 'Завершено' : 'В процесі'}
                      </p>
                    </div>
                  </div>
                ))
              ))}
            </div>

            {/* Вміст документа */}
            {selectedDocument && (
              <CanvasDocument
                projectId={project.id}
                documentId={selectedDocument}
                onBack={() => setSelectedDocument(null)}
              />
            )}
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
