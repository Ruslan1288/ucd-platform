import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface ProjectNavigationTreeProps {
  project: any;
  onSelectStage: (stage: string) => void;
  onSelectSubstage: (stage: string, substage: string) => void;
}

export const ProjectNavigationTree: React.FC<ProjectNavigationTreeProps> = ({
  project,
  onSelectStage,
  onSelectSubstage,
}) => {
  const [expandedStages, setExpandedStages] = React.useState<Set<string>>(new Set());

  const toggleStage = (stageId: string) => {
    const newExpanded = new Set(expandedStages);
    if (expandedStages.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Навігація по проекту</h2>
      </div>
      
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-sm font-medium mb-2">UCD Процес</div>
        
        {project.stages?.map((stage: any) => (
          <div key={stage.id} className="space-y-1">
            <div
              className="flex items-center gap-1 cursor-pointer hover:text-blue-600 py-1"
              onClick={() => toggleStage(stage.id)}
            >
              {expandedStages.has(stage.id) ? (
                <ChevronDown className="w-4 h-4 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0" />
              )}
              <span className="text-sm">{stage.name}</span>
            </div>
            
            {expandedStages.has(stage.id) && (
              <div className="pl-6 space-y-1">
                {stage.substages?.map((substage: any) => (
                  <div
                    key={substage.id}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 cursor-pointer py-1"
                    onClick={() => onSelectSubstage(stage.id, substage.id)}
                  >
                    {substage.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
