import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Position,
  Handle,
  NodeProps,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  ChevronLeft,
  ChevronRight,
  GripHorizontal,
  Trash2,
  Save,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { BLOCK_TEMPLATES } from '../constants';
import { CanvasBackground } from './ui/canvas-background';

interface CanvasDocumentProps {
  projectId: string;
  stageId: string;
  documentId: string;
  onBack: () => void;
  onNext: () => void;
}

interface NodeData {
  type: keyof typeof BLOCK_TEMPLATES;
  content: any;
  label: string;
}

interface CustomNodeProps {
  id: string;
  data: NodeData;
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>;
}

// Стилі для drag-and-drop
const onDragStart = (event: React.DragEvent, nodeType: string) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

export function CanvasDocument({
  projectId,
  stageId,
  documentId,
  onBack,
  onNext,
}: CanvasDocumentProps) {
  const [nodes, setNodes] = useNodesState<NodeData>([]);
  const [edges, setEdges] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Функція для збереження стану документа
  const saveDocument = async () => {
    if (!reactFlowInstance) return;
    
    setIsSaving(true);
    try {
      const flow = reactFlowInstance.toObject();
      const storageKey = `document-${projectId}-${stageId}-${documentId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        nodes: flow.nodes,
        edges: flow.edges,
        viewport: flow.viewport,
      }));
      
      // Імітуємо затримку мережі
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Завантаження документа при першому рендері
  useEffect(() => {
    const loadDocument = () => {
      try {
        const storageKey = `document-${projectId}-${stageId}-${documentId}`;
        const savedData = localStorage.getItem(storageKey);
        
        if (savedData) {
          const data = JSON.parse(savedData);
          if (data.nodes) setNodes(data.nodes);
          if (data.edges) setEdges(data.edges);
        }
      } catch (error) {
        console.error('Failed to load document:', error);
      }
    };

    loadDocument();
  }, [documentId, projectId, stageId]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const template = BLOCK_TEMPLATES[type as keyof typeof BLOCK_TEMPLATES];

      if (!template || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<NodeData> = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'custom',
        position,
        data: {
          type: template.type,
          content: template.defaultContent,
          label: template.title,
        },
        draggable: true,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const addBlock = (type: keyof typeof BLOCK_TEMPLATES) => {
    const template = BLOCK_TEMPLATES[type];
    const newBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: template.defaultContent,
      label: template.title,
      position: { x: 100, y: 100 },
    };
    setNodes((nodes) => [...nodes, newBlock]);
  };

  // Компонент для відображення контенту блоку
  const BlockContent = ({ type, content, onChange }: { type: keyof typeof BLOCK_TEMPLATES; content: any; onChange: (content: any) => void }) => {
    switch (type) {
      case 'FUNCTIONAL_REQ':
        return (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <textarea
              className="w-full p-2 border rounded bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
              value={content.description || ''}
              onChange={(e) => onChange({ ...content, description: e.target.value })}
              placeholder="Опишіть функціональну вимогу..."
              rows={3}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Пріоритет:</span>
              <select
                className="text-sm border rounded bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
                value={content.priority || 'medium'}
                onChange={(e) => onChange({ ...content, priority: e.target.value })}
              >
                <option value="high">Високий</option>
                <option value="medium">Середній</option>
                <option value="low">Низький</option>
              </select>
            </div>
            <input
              type="text"
              className="w-full p-2 border rounded text-sm bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
              value={content.category || ''}
              onChange={(e) => onChange({ ...content, category: e.target.value })}
              placeholder="Категорія..."
            />
          </div>
        );

      case 'USER_STORY':
        return (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <textarea
              className="w-full p-2 border rounded bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
              value={content.story || ''}
              onChange={(e) => onChange({ ...content, story: e.target.value })}
              placeholder="Як [роль] я хочу [дія] щоб [цінність]..."
              rows={3}
            />
            <input
              type="text"
              className="w-full p-2 border rounded text-sm bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
              value={content.acceptance || ''}
              onChange={(e) => onChange({ ...content, acceptance: e.target.value })}
              placeholder="Критерії прийняття..."
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Story Points:</span>
              <input
                type="number"
                className="w-20 p-1 border rounded text-sm bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
                value={content.points || 0}
                onChange={(e) => onChange({ ...content, points: parseInt(e.target.value) })}
                min={0}
                max={13}
              />
            </div>
          </div>
        );

      case 'USE_CASE':
        return (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              className="w-full p-2 border rounded bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
              value={content.title || ''}
              onChange={(e) => onChange({ ...content, title: e.target.value })}
              placeholder="Назва use case..."
            />
            <input
              type="text"
              className="w-full p-2 border rounded text-sm bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
              value={content.actor || ''}
              onChange={(e) => onChange({ ...content, actor: e.target.value })}
              placeholder="Актор..."
            />
            <textarea
              className="w-full p-2 border rounded text-sm bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
              value={content.steps || ''}
              onChange={(e) => onChange({ ...content, steps: e.target.value })}
              placeholder="1. Користувач...\n2. Система..."
              rows={3}
            />
            <textarea
              className="w-full p-2 border rounded text-sm bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
              value={content.conditions || ''}
              onChange={(e) => onChange({ ...content, conditions: e.target.value })}
              placeholder="Передумови та постумови..."
              rows={2}
            />
          </div>
        );

      case 'NON_FUNCTIONAL_REQ':
        return (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <textarea
              className="w-full p-2 border rounded bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
              value={content.description || ''}
              onChange={(e) => onChange({ ...content, description: e.target.value })}
              placeholder="Опишіть нефункціональну вимогу..."
              rows={3}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Тип:</span>
              <select
                className="text-sm border rounded bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
                value={content.type || 'performance'}
                onChange={(e) => onChange({ ...content, type: e.target.value })}
              >
                <option value="performance">Продуктивність</option>
                <option value="security">Безпека</option>
                <option value="usability">Зручність використання</option>
                <option value="reliability">Надійність</option>
                <option value="maintainability">Підтримуваність</option>
              </select>
            </div>
          </div>
        );

      case 'CONSTRAINTS':
        return (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <textarea
              className="w-full p-2 border rounded bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
              value={content.text || ''}
              onChange={(e) => onChange({ ...content, text: e.target.value })}
              placeholder="Опишіть обмеження..."
              rows={3}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Вплив:</span>
              <select
                className="text-sm border rounded bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
                value={content.impact || 'medium'}
                onChange={(e) => onChange({ ...content, impact: e.target.value })}
              >
                <option value="high">Високий</option>
                <option value="medium">Середній</option>
                <option value="low">Низький</option>
              </select>
            </div>
          </div>
        );

      case 'DEPENDENCIES':
        return (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <textarea
              className="w-full p-2 border rounded bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
              value={content.text || ''}
              onChange={(e) => onChange({ ...content, text: e.target.value })}
              placeholder="Опишіть залежність..."
              rows={3}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Тип:</span>
              <select
                className="text-sm border rounded bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
                value={content.type || 'internal'}
                onChange={(e) => onChange({ ...content, type: e.target.value })}
              >
                <option value="internal">Внутрішня</option>
                <option value="external">Зовнішня</option>
                <option value="technical">Технічна</option>
                <option value="business">Бізнес</option>
              </select>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <textarea
              className="w-full p-2 border rounded bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 nodrag"
              value={content.text || ''}
              onChange={(e) => onChange({ ...content, text: e.target.value })}
              placeholder="Додайте текст..."
              rows={4}
            />
          </div>
        );
    }
  };

  // Компонент для кастомної ноди
  const CustomNode = ({ data, id, setNodes }: CustomNodeProps) => {
    const Icon = BLOCK_TEMPLATES[data.type].icon;
    
    return (
      <div className="relative bg-white shadow-lg rounded-lg p-4 w-[320px]">
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
        
        <div className="flex items-center justify-between mb-3 pb-2 border-b">
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-gray-400" />
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">{data.label}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              setNodes((nodes) => nodes.filter((node) => node.id !== id));
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="min-h-[100px]" onClick={(e) => e.stopPropagation()}>
          <BlockContent
            type={data.type}
            content={data.content}
            onChange={(newContent) => {
              setNodes((nodes) =>
                nodes.map((node) =>
                  node.id === id
                    ? { ...node, data: { ...node.data, content: newContent } }
                    : node
                )
              );
            }}
          />
        </div>
      </div>
    );
  };

  const nodeTypes = useMemo(
    () => ({
      custom: (props: any) => <CustomNode {...props} setNodes={setNodes} />,
    }),
    [setNodes]
  );

  return (
    <div className="h-full flex flex-col">
      {/* Верхня панель інструментів */}
      <div className="border-b bg-white/80 backdrop-blur-sm p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xl font-semibold">{documentId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={saveDocument}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                  Збереження...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Зберегти
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Основна область канвасу */}
        <ReactFlowProvider>
          <div className="flex-1 relative bg-gray-50">
            <CanvasBackground />
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={(changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds))}
              onEdgesChange={(changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds))}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDragOver={onDragOver}
              onDrop={onDrop}
              nodeTypes={nodeTypes}
              fitView
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: true,
              }}
              proOptions={{ hideAttribution: true }}
            >
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        </ReactFlowProvider>

        {/* Права панель з шаблонами */}
        <div 
          className={`w-72 border-l bg-white/80 backdrop-blur-sm p-4 absolute right-0 top-0 bottom-0 z-50 transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <h2 className="font-semibold mb-4 text-gray-700">Шаблони блоків</h2>
          <div className="space-y-2">
            {Object.values(BLOCK_TEMPLATES).map((template) => (
              <div
                key={template.type}
                className="cursor-grab active:cursor-grabbing"
                onDragStart={(event) => onDragStart(event, template.type)}
                draggable
              >
                <Button
                  variant="outline"
                  className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <template.icon className="w-4 h-4 mr-2 text-gray-500" />
                  {template.title}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
