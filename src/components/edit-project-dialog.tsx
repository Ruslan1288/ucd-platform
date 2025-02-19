import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  name: string;
  description: string;
}

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdated: () => void;
}

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
  onProjectUpdated
}: EditProjectDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setProjectDescription(project.description);
    }
  }, [project]);

  const handleSubmit = async () => {
    if (!project) return;

    try {
      setIsLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('projects')
        .update({
          name: projectName,
          description: projectDescription
        })
        .eq('id', project.id);

      if (updateError) throw updateError;

      onProjectUpdated();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка при оновленні проекту');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Редагування проекту</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Назва проекту</label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Введіть назву проекту"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Опис проекту</label>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Введіть опис проекту"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Скасувати
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Збереження...' : 'Зберегти'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
