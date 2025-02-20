import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import {
  NewProject,
  ProjectMember,
  ProjectType,
  ProjectPriority,
  PROJECT_TYPES,
  PROJECT_ROLES,
  PROJECT_PRIORITIES,
  PROJECT_STAGES
} from '@/types/project';

interface CreateProjectStepsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: () => void;
}

const projectStages = [
  {
    id: 1,
    name: "Планування та Дослідження",
    substages: [
      { id: "1.1", name: "Аналіз вимог" },
      { id: "1.2", name: "Дослідження користувачів" },
      { id: "1.3", name: "Визначення цілей" },
      { id: "1.4", name: "Планування ресурсів" }
    ]
  },
  {
    id: 2,
    name: "Визначення та Моделювання",
    substages: [
      { id: "2.1", name: "Створення персон" },
      { id: "2.2", name: "Моделювання сценаріїв" },
      { id: "2.3", name: "Визначення функціональних вимог" }
    ]
  },
  {
    id: 3,
    name: "Проектування",
    substages: [
      { id: "3.1", name: "Інформаційна архітектура" },
      { id: "3.2", name: "Wireframes" },
      { id: "3.3", name: "Прототипи" },
      { id: "3.4", name: "UI дизайн" }
    ]
  },
  {
    id: 4,
    name: "Тестування та Валідація",
    substages: [
      { id: "4.1", name: "Юзабіліті тестування" },
      { id: "4.2", name: "Експертна оцінка" },
      { id: "4.3", name: "Аналіз результатів" }
    ]
  },
  {
    id: 5,
    name: "Впровадження та Моніторинг",
    substages: [
      { id: "5.1", name: "Підготовка до впровадження" },
      { id: "5.2", name: "Запуск" },
      { id: "5.3", name: "Моніторинг показників" }
    ]
  },
  {
    id: 6,
    name: "Документація та Артефакти",
    substages: [
      { id: "6.1", name: "Технічна документація" },
      { id: "6.2", name: "Користувацька документація" },
      { id: "6.3", name: "Збереження артефактів" }
    ]
  }
];

export function CreateProjectSteps({
  open,
  onOpenChange,
  onProjectCreated
}: CreateProjectStepsProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Основна інформація
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProjectType>('website');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Команда та організація
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('designer');
  const [client, setClient] = useState('');
  const [priority, setPriority] = useState<ProjectPriority>('medium');

  // Етапи
  const [selectedStages, setSelectedStages] = useState([]);

  const handleAddMember = () => {
    if (newMemberName && newMemberEmail) {
      setMembers([
        ...members,
        {
          id: Date.now().toString(),
          name: newMemberName,
          email: newMemberEmail,
          role: newMemberRole as any,
        },
      ]);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberRole('designer');
    }
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };

  const handleCreateProject = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Валідація даних
      if (!name.trim()) {
        throw new Error('Будь ласка, введіть назву проекту');
      }

      if (!description.trim()) {
        throw new Error('Будь ласка, введіть опис проекту');
      }

      if (!startDate) {
        throw new Error('Будь ласка, оберіть дату початку проекту');
      }

      if (!endDate) {
        throw new Error('Будь ласка, оберіть дату завершення проекту');
      }

      if (!client.trim()) {
        throw new Error('Будь ласка, вкажіть замовника/клієнта');
      }

      if (selectedStages.length === 0) {
        throw new Error('Будь ласка, оберіть хоча б один етап проекту');
      }

      // Отримуємо поточного користувача
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Користувач не авторизований');
      }

      console.log('Creating project with data:', {
        name,
        description,
        type,
        startDate,
        endDate,
        client,
        priority,
        user_id: user.id
      });

      // Створюємо новий проект
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          type,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          client,
          priority,
          user_id: user.id
        })
        .select()
        .single();

      if (projectError) {
        console.error('Project creation error:', projectError);
        throw new Error(`Помилка при створенні проекту: ${projectError.message}`);
      }

      if (!project) {
        throw new Error('Помилка: проект не було створено');
      }

      console.log('Project created:', project);

      // Зберігаємо учасників проекту
      if (members.length > 0) {
        const { error: membersError } = await supabase
          .from('project_members')
          .insert(members.map(member => ({
            project_id: project.id,
            name: member.name,
            email: member.email,
            role: member.role
          })));

        if (membersError) {
          console.error('Members creation error:', membersError);
          throw new Error(`Помилка при додаванні учасників: ${membersError.message}`);
        }
      }

      // Зберігаємо етапи проекту
      if (selectedStages.length > 0) {
        const stagesWithProjectId = selectedStages.map(stage => ({
          project_id: project.id,
          stage_id: stage.id,
          name: stage.name,
          status: 'in_progress',
          substages: JSON.stringify(stage.substages)
        }));

        const { error: stagesError } = await supabase
          .from('project_stages')
          .insert(stagesWithProjectId);

        if (stagesError) {
          console.error('Stages creation error:', stagesError);
          throw new Error(`Помилка при додаванні етапів: ${stagesError.message}`);
        }
      }

      onProjectCreated?.();
      onOpenChange(false);
      resetForm();
      
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Помилка при створенні проекту');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setName('');
    setDescription('');
    setType('website');
    setStartDate(undefined);
    setEndDate(undefined);
    setMembers([]);
    setClient('');
    setPriority('medium');
    setSelectedStages([]);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Назва проекту</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введіть назву проекту"
        />
      </div>

      <div className="space-y-2">
        <Label>Опис проекту</Label>
        <textarea
          className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Введіть опис проекту"
        />
      </div>

      <div className="space-y-2">
        <Label>Тип проекту</Label>
        <Select value={type} onValueChange={(value: ProjectType) => setType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_TYPES.map(type => (
              <SelectItem key={type.id} value={type.id}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Дата початку</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP', { locale: uk }) : "Оберіть дату"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Дата завершення</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP', { locale: uk }) : "Оберіть дату"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Учасники проекту</Label>
        <div className="grid grid-cols-[1fr,1fr,auto] gap-2 items-end">
          <div>
            <Label>Ім'я</Label>
            <Input
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Ім'я учасника"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Email учасника"
              type="email"
            />
          </div>
          <div>
            <Label>Роль</Label>
            <Select value={newMemberRole} onValueChange={setNewMemberRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_ROLES.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddMember} className="mt-2">
            <Plus className="w-4 h-4 mr-2" />
            Додати
          </Button>
        </div>

        <div className="space-y-2">
          {members.map(member => (
            <div
              key={member.id}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
                <p className="text-sm text-gray-500">
                  {PROJECT_ROLES.find(role => role.id === member.role)?.label}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveMember(member.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Замовник/клієнт</Label>
        <Input
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="Введіть назву компанії або ім'я замовника"
        />
      </div>

      <div className="space-y-2">
        <Label>Пріоритет</Label>
        <Select value={priority} onValueChange={(value: ProjectPriority) => setPriority(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_PRIORITIES.map(priority => (
              <SelectItem key={priority.id} value={priority.id}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const StageSelectionStep = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Оберіть етапи та підетапи вашого проекту. Натисніть на етап, щоб побачити підетапи.
      </div>

      <Accordion type="multiple" className="w-full space-y-2">
        {projectStages.map((stage) => (
          <AccordionItem 
            key={stage.id} 
            value={stage.id.toString()}
            className="border rounded-lg px-4"
          >
            <div className="flex items-center gap-2">
              <Checkbox
                id={`stage-${stage.id}`}
                checked={selectedStages.some(s => s.id === stage.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedStages([...selectedStages, {
                      id: stage.id,
                      name: stage.name,
                      substages: stage.substages.map(sub => ({
                        id: sub.id,
                        name: sub.name,
                        completed: false
                      }))
                    }]);
                  } else {
                    setSelectedStages(selectedStages.filter(s => s.id !== stage.id));
                  }
                }}
              />
              <AccordionTrigger className="hover:no-underline flex-1">
                <span className="text-sm font-medium cursor-pointer">
                  {stage.name}
                </span>
              </AccordionTrigger>
            </div>
            <AccordionContent>
              <div className="pl-6 space-y-2 mt-2">
                {stage.substages.map((substage) => (
                  <div key={substage.id} className="flex items-center gap-2 py-1">
                    <Checkbox
                      id={`substage-${substage.id}`}
                      checked={selectedStages
                        .find(s => s.id === stage.id)
                        ?.substages.some(sub => sub.id === substage.id) ?? false}
                      onCheckedChange={(checked) => {
                        const stageIndex = selectedStages.findIndex(s => s.id === stage.id);
                        
                        if (stageIndex === -1 && checked) {
                          // Якщо етап ще не вибраний, додаємо його з цим підетапом
                          setSelectedStages([...selectedStages, {
                            id: stage.id,
                            name: stage.name,
                            substages: [{
                              id: substage.id,
                              name: substage.name,
                              completed: false
                            }]
                          }]);
                        } else if (stageIndex !== -1) {
                          // Оновлюємо існуючий етап
                          setSelectedStages(selectedStages.map((s, index) => {
                            if (index === stageIndex) {
                              const newSubstages = checked
                                ? [...s.substages, {
                                    id: substage.id,
                                    name: substage.name,
                                    completed: false
                                  }]
                                : s.substages.filter(sub => sub.id !== substage.id);
                              
                              return {
                                ...s,
                                substages: newSubstages
                              };
                            }
                            return s;
                          }));
                        }
                      }}
                    />
                    <label 
                      htmlFor={`substage-${substage.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {substage.name}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Створення проекту - Крок {currentStep} з 3</DialogTitle>
          <DialogDescription>
            {currentStep === 1 && "Введіть основну інформацію про проект"}
            {currentStep === 2 && "Додайте учасників проекту та оберіть пріоритет"}
            {currentStep === 3 && "Оберіть етапи та підетапи проекту"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <div className="py-4">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && <StageSelectionStep />}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
            >
              Назад
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Скасувати
              </Button>
              {currentStep === 3 ? (
                <Button 
                  type="button"
                  onClick={handleCreateProject}
                  disabled={isLoading}
                >
                  {isLoading ? 'Створення...' : 'Створити проект'}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNextStep}
                >
                  Далі
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
