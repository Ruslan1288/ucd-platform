import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface ProjectsListProps {
  projects: Project[];
  onProjectDeleted: () => void;
  onEditProject: (project: Project) => void;
  onViewProject: (project: Project) => void;
}

export function ProjectsList({ 
  projects, 
  onProjectDeleted, 
  onEditProject,
  onViewProject 
}: ProjectsListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (projectId: string) => {
    try {
      setIsDeleting(projectId);
      
      // Видаляємо спочатку пов'язані етапи проекту
      const { error: stagesError } = await supabase
        .from('project_stages')
        .delete()
        .eq('project_id', projectId);

      if (stagesError) throw stagesError;

      // Видаляємо сам проект
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      onProjectDeleted();
    } catch (error) {
      console.error('Помилка при видаленні проекту:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card 
          key={project.id} 
          className="hover:shadow-md transition-shadow cursor-pointer"
        >
          <CardContent className="p-6">
            <div 
              className="flex justify-between items-start"
              onClick={(e) => {
                // Перевіряємо, чи клік не був на кнопках
                const target = e.target as HTMLElement;
                if (!target.closest('button')) {
                  onViewProject(project);
                }
              }}
            >
              <div>
                <h3 className="text-lg font-semibold hover:text-blue-600">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {project.description}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Створено: {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditProject(project)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(project.id)}
                  disabled={isDeleting === project.id}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {projects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Немає доступних проектів
        </div>
      )}
    </div>
  );
}
