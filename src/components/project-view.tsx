import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/lib/supabase';

interface ProjectStage {
  id: string;
  project_id: string;
  stage_id: string;
  name: string;
  status: string;
  substages: Array<{
    id: string;
    name: string;
    completed: boolean;
  }>;
}

interface ProjectViewProps {
  project: any;
  onBack: () => void;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ project, onBack }) => {
  const [selectedDocument, setSelectedDocument] = React.useState<string | null>(null);
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

        if (error) throw error;
        
        // Парсимо JSON рядок substages для кожного етапу
        const parsedStages = (data || []).map(stage => ({
          ...stage,
          substages: stage.substages ? JSON.parse(stage.substages) : []
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
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Назад до проектів
            </Button>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
          </div>

          <div className="space-y-6">
            {selectedDocument ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedDocument}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-500">
                      Тут буде вміст документу "{selectedDocument}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-500">
                Оберіть документ для перегляду в меню справа
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Правий сайдбар */}
      <div className="w-64 border-l bg-background">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Документи проекту</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="ucd-process">
                <AccordionTrigger className="px-4">UCD Процес</AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 pr-2 pb-2">
                    <Accordion type="single" collapsible className="w-full">
                      {isLoading ? (
                        <div className="text-sm text-gray-500 p-4">
                          Завантаження етапів...
                        </div>
                      ) : projectStages.length > 0 ? (
                        projectStages.map((stage) => (
                          <AccordionItem key={stage.id} value={stage.id}>
                            <AccordionTrigger className="text-sm">
                              {stage.name}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-1 pl-4">
                                {stage.substages?.map((substage) => (
                                  <div
                                    key={substage.id}
                                    onClick={() => setSelectedDocument(substage.name)}
                                    className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                                  >
                                    {substage.name}
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 p-4">
                          Етапи проекту не вибрані
                        </div>
                      )}
                    </Accordion>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="documents">
                <AccordionTrigger className="px-4">Документи</AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 pr-2 pb-2 space-y-1">
                    <button
                      onClick={() => setSelectedDocument('Технічне завдання')}
                      className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Технічне завдання
                    </button>
                    <button
                      onClick={() => setSelectedDocument('Специфікація вимог')}
                      className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Специфікація вимог
                    </button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
};
