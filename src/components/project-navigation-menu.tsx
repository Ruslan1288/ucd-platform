import React from 'react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ProjectNavigationMenuProps {
  project: any;
  onSelectDocument: (document: string) => void;
}

export const ProjectNavigationMenu: React.FC<ProjectNavigationMenuProps> = ({
  project,
  onSelectDocument,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Навігація по проекту</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="ucd-process">
            <AccordionTrigger className="px-4">UCD Процес</AccordionTrigger>
            <AccordionContent>
              <div className="pl-4 pr-2 pb-2">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="planning">
                    <AccordionTrigger className="text-sm">
                      Планування та Дослідження
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-4">
                        <button
                          onClick={() => onSelectDocument('Визначення та Моделювання')}
                          className={cn(
                            "w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground",
                            "transition-colors"
                          )}
                        >
                          Визначення та Моделювання
                        </button>
                        <button
                          onClick={() => onSelectDocument('Дослідження користувачів')}
                          className={cn(
                            "w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground",
                            "transition-colors"
                          )}
                        >
                          Дослідження користувачів
                        </button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {project.stages?.map((stage: any) => (
                    <AccordionItem key={stage.id} value={stage.id}>
                      <AccordionTrigger className="text-sm">
                        {stage.name}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 pl-4">
                          {stage.substages?.map((substage: any) => (
                            <button
                              key={substage.id}
                              onClick={() => onSelectDocument(substage.name)}
                              className={cn(
                                "w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground",
                                "transition-colors"
                              )}
                            >
                              {substage.name}
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="documents">
            <AccordionTrigger className="px-4">Документи</AccordionTrigger>
            <AccordionContent>
              <div className="pl-4 pr-2 pb-2 space-y-1">
                <button
                  onClick={() => onSelectDocument('Технічне завдання')}
                  className={cn(
                    "w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground",
                    "transition-colors"
                  )}
                >
                  Технічне завдання
                </button>
                <button
                  onClick={() => onSelectDocument('Специфікація вимог')}
                  className={cn(
                    "w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground",
                    "transition-colors"
                  )}
                >
                  Специфікація вимог
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
