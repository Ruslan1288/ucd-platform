import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, MinusCircle, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessGoal {
  id: string;
  content: string;
  priority: number;
}

interface UserGoal {
  id: string;
  benefit: string;
  problem: string;
  need: string;
}

interface SuccessCriteria {
  id: string;
  quantitative: string;
  qualitative: string;
  metrics: string;
}

interface ProjectLimitation {
  id: string;
  technical: string;
  business: string;
  time: string;
}

interface DocumentTemplateProps {
  projectId: string;
  stageId: string;
  documentId: string;
  onBack: () => void;
  onNext: () => void;
}

export function DocumentTemplate({
  projectId,
  stageId,
  documentId,
  onBack,
  onNext
}: DocumentTemplateProps) {
  // Стан для всіх розділів документа
  const [businessGoals, setBusinessGoals] = useState<BusinessGoal[]>([{ 
    id: '1', 
    content: '', 
    priority: 1 
  }]);
  
  const [userGoals, setUserGoals] = useState<UserGoal[]>([{
    id: '1',
    benefit: '',
    problem: '',
    need: ''
  }]);

  const [successCriteria, setSuccessCriteria] = useState<SuccessCriteria>({
    id: '1',
    quantitative: '',
    qualitative: '',
    metrics: ''
  });

  const [limitations, setLimitations] = useState<ProjectLimitation>({
    id: '1',
    technical: '',
    business: '',
    time: ''
  });

  const [progress, setProgress] = useState(0);
  const [isDraft, setIsDraft] = useState(true);

  // Функція для розрахунку прогресу заповнення
  const calculateProgress = () => {
    let filled = 0;
    let total = 0;

    // Перевіряємо бізнес-цілі
    businessGoals.forEach(goal => {
      if (goal.content.trim()) filled++;
      total++;
    });

    // Перевіряємо користувацькі цілі
    userGoals.forEach(goal => {
      if (goal.benefit.trim()) filled++;
      if (goal.problem.trim()) filled++;
      if (goal.need.trim()) filled++;
      total += 3;
    });

    // Перевіряємо критерії успіху
    if (successCriteria.quantitative.trim()) filled++;
    if (successCriteria.qualitative.trim()) filled++;
    if (successCriteria.metrics.trim()) filled++;
    total += 3;

    // Перевіряємо обмеження
    if (limitations.technical.trim()) filled++;
    if (limitations.business.trim()) filled++;
    if (limitations.time.trim()) filled++;
    total += 3;

    return (filled / total) * 100;
  };

  // Ефект для оновлення прогресу
  useEffect(() => {
    const newProgress = calculateProgress();
    setProgress(newProgress);
  }, [businessGoals, userGoals, successCriteria, limitations]);

  // Функції для роботи з бізнес-цілями
  const addBusinessGoal = () => {
    setBusinessGoals([
      ...businessGoals,
      { id: Date.now().toString(), content: '', priority: businessGoals.length + 1 }
    ]);
  };

  const removeBusinessGoal = (id: string) => {
    setBusinessGoals(businessGoals.filter(goal => goal.id !== id));
  };

  const updateBusinessGoal = (id: string, content: string) => {
    setBusinessGoals(businessGoals.map(goal => 
      goal.id === id ? { ...goal, content } : goal
    ));
  };

  // Функція для автозбереження
  const autoSave = async () => {
    try {
      // TODO: Implement autosave logic
      console.log('Автозбереження...');
    } catch (error) {
      console.error('Помилка автозбереження:', error);
    }
  };

  return (
    <div className="flex h-full">
      {/* Основний контент */}
      <div className="flex-1 overflow-auto p-6">
        {/* Хлібні крихти і заголовок */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">
            1. Планування та Дослідження / 1.1 Визначення проекту
          </div>
          <h1 className="text-2xl font-semibold">Цілі та завдання проекту</h1>
        </div>

        {/* Прогрес заповнення */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Прогрес заповнення</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Форма документа */}
        <div className="space-y-8">
          {/* Бізнес-цілі */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Бізнес-цілі проекту</h2>
            <div className="space-y-4">
              {businessGoals.map((goal, index) => (
                <div key={goal.id} className="flex gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <Textarea
                      value={goal.content}
                      onChange={(e) => updateBusinessGoal(goal.id, e.target.value)}
                      placeholder="Опишіть бізнес-ціль..."
                      className="w-full"
                    />
                  </div>
                  {businessGoals.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBusinessGoal(goal.id)}
                    >
                      <MinusCircle className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addBusinessGoal}
                className="w-full"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Додати ціль
              </Button>
            </div>
          </section>

          {/* Користувацькі цілі */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Користувацькі цілі</h2>
            {userGoals.map((goal) => (
              <div key={goal.id} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Що користувач має отримати
                  </label>
                  <Textarea
                    value={goal.benefit}
                    onChange={(e) => setUserGoals(userGoals.map(g =>
                      g.id === goal.id ? { ...g, benefit: e.target.value } : g
                    ))}
                    placeholder="Опишіть користь для користувача..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Які проблеми вирішуються
                  </label>
                  <Textarea
                    value={goal.problem}
                    onChange={(e) => setUserGoals(userGoals.map(g =>
                      g.id === goal.id ? { ...g, problem: e.target.value } : g
                    ))}
                    placeholder="Опишіть проблеми, які вирішує проект..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Які потреби задовольняються
                  </label>
                  <Textarea
                    value={goal.need}
                    onChange={(e) => setUserGoals(userGoals.map(g =>
                      g.id === goal.id ? { ...g, need: e.target.value } : g
                    ))}
                    placeholder="Опишіть потреби користувачів..."
                    className="mt-2"
                  />
                </div>
              </div>
            ))}
          </section>

          {/* Критерії успіху */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Критерії успіху</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Кількісні показники
                </label>
                <Textarea
                  value={successCriteria.quantitative}
                  onChange={(e) => setSuccessCriteria({
                    ...successCriteria,
                    quantitative: e.target.value
                  })}
                  placeholder="Опишіть кількісні показники успіху..."
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Якісні показники
                </label>
                <Textarea
                  value={successCriteria.qualitative}
                  onChange={(e) => setSuccessCriteria({
                    ...successCriteria,
                    qualitative: e.target.value
                  })}
                  placeholder="Опишіть якісні показники успіху..."
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Метрики для вимірювання
                </label>
                <Textarea
                  value={successCriteria.metrics}
                  onChange={(e) => setSuccessCriteria({
                    ...successCriteria,
                    metrics: e.target.value
                  })}
                  placeholder="Опишіть метрики для вимірювання успіху..."
                  className="mt-2"
                />
              </div>
            </div>
          </section>

          {/* Обмеження проекту */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Обмеження проекту</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Технічні обмеження
                </label>
                <Textarea
                  value={limitations.technical}
                  onChange={(e) => setLimitations({
                    ...limitations,
                    technical: e.target.value
                  })}
                  placeholder="Опишіть технічні обмеження проекту..."
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Бізнес-обмеження
                </label>
                <Textarea
                  value={limitations.business}
                  onChange={(e) => setLimitations({
                    ...limitations,
                    business: e.target.value
                  })}
                  placeholder="Опишіть бізнес-обмеження проекту..."
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Часові обмеження
                </label>
                <Textarea
                  value={limitations.time}
                  onChange={(e) => setLimitations({
                    ...limitations,
                    time: e.target.value
                  })}
                  placeholder="Опишіть часові обмеження проекту..."
                  className="mt-2"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Навігаційні кнопки */}
        <div className="sticky bottom-0 bg-white border-t mt-8 -mx-6 px-6 py-4 flex justify-between items-center">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {isDraft ? 'Чернетка' : 'Готово'}
            </span>
            <Button variant="outline" onClick={() => setIsDraft(false)}>
              <Save className="h-4 w-4 mr-2" />
              Зберегти
            </Button>
            <Button onClick={onNext}>
              Далі
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Бічна панель */}
      <div className="w-80 border-l bg-gray-50/40 p-6 overflow-auto">
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Підказки</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                Заповнюйте кожен розділ максимально конкретно та вимірювано.
              </p>
              <p>
                Використовуйте принцип SMART при формулюванні цілей.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Приклади</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Бізнес-ціль:</strong>
                {" "}Збільшити конверсію продажів на 25% протягом 6 місяців
              </p>
              <p>
                <strong>Користувацька ціль:</strong>
                {" "}Зменшити час оформлення замовлення до 2 хвилин
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Типові помилки</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>- Занадто загальні формулювання</p>
              <p>- Відсутність конкретних метрик</p>
              <p>- Нереалістичні часові рамки</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
