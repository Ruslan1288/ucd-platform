import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { CreateProjectSteps } from './components/create-project-steps';
import { EditProjectDialog } from './components/edit-project-dialog';
import { ProjectsList } from './components/projects-list';
import { ProjectView } from './components/project-view';
import { supabase } from './lib/supabase';
import { AuthForm } from './components/auth-form';
import {
  LayoutDashboard,
  FolderPlus,
  Book,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const UCDPlatform = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showProjectTree, setShowProjectTree] = useState(false);

  // Навігаційні елементи
  const navigation = [
    { name: 'Дашборд', icon: LayoutDashboard, tab: 'dashboard' },
    { name: 'Проекти', icon: FolderPlus, tab: 'projects' },
    { name: 'База знань', icon: Book, tab: 'knowledge' },
    { name: 'Налаштування', icon: Settings, tab: 'settings' }
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка при завантаженні проектів');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!user) {
    return <AuthForm onAuthSuccess={() => {}} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Лівий сайдбар */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">UCD Platform</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <button
              key={item.tab}
              onClick={() => {
                setActiveTab(item.tab);
                if (item.tab !== 'projects') {
                  setSelectedProject(null);
                  setShowProjectTree(false);
                }
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                activeTab === item.tab
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Вийти
          </Button>
        </div>
      </div>

      {/* Основний контент */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          <header className="bg-white border-b">
            <div className="px-6 py-4 flex justify-between items-center">
              <h1 className="text-xl font-semibold">
                {navigation.find(item => item.tab === activeTab)?.name}
              </h1>
              <Button
                onClick={() => setIsCreateProjectOpen(true)}
                className="flex items-center gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                Новий проект
              </Button>
            </div>
          </header>

          <main className="p-6">
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Активні проекти</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-600"
                      onClick={() => setActiveTab('projects')}
                    >
                      Всі проекти
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded mb-4">
                        {error}
                      </div>
                    )}
                    
                    {isLoading ? (
                      <div className="text-center py-4 text-gray-500">
                        Завантаження проектів...
                      </div>
                    ) : (
                      <ProjectsList
                        projects={projects.slice(0, 3)}
                        onProjectDeleted={fetchProjects}
                        onEditProject={(project) => {
                          setSelectedProject(project);
                          setIsEditProjectOpen(true);
                        }}
                        onViewProject={(project) => {
                          setSelectedProject(project);
                          setShowProjectTree(true);
                          setActiveTab('projects');
                        }}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>База знань</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h3 className="font-medium">Популярні статті</h3>
                      <ul className="space-y-2">
                        <li className="text-sm">
                          <a href="#" className="text-blue-600 hover:underline">
                            Як створити ефективні персони
                          </a>
                        </li>
                        <li className="text-sm">
                          <a href="#" className="text-blue-600 hover:underline">
                            Проведення користувацьких досліджень
                          </a>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                {selectedProject ? (
                  <ProjectView
                    project={selectedProject}
                    onBack={() => {
                      setSelectedProject(null);
                      setShowProjectTree(false);
                    }}
                  />
                ) : (
                  <ProjectsList
                    projects={projects}
                    onProjectDeleted={fetchProjects}
                    onEditProject={(project) => {
                      setSelectedProject(project);
                      setIsEditProjectOpen(true);
                    }}
                    onViewProject={(project) => {
                      setSelectedProject(project);
                      setShowProjectTree(true);
                    }}
                  />
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <CreateProjectSteps
        open={isCreateProjectOpen}
        onOpenChange={setIsCreateProjectOpen}
        onProjectCreated={fetchProjects}
      />

      <EditProjectDialog
        project={selectedProject}
        open={isEditProjectOpen}
        onOpenChange={setIsEditProjectOpen}
        onProjectUpdated={fetchProjects}
      />
    </div>
  );
};

export default UCDPlatform;