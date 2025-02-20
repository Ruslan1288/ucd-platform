import React, { useEffect, useState } from 'react';
import { Bell, Clock, AlertTriangle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Button } from './ui/button';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'deadline_week' | 'deadline_three_days' | 'deadline_day' | 'overdue';
  message: string;
  created_at: string;
  read_at: string | null;
}

interface ProjectNotificationsProps {
  projectId: string;
}

export const ProjectNotifications: React.FC<ProjectNotificationsProps> = ({ projectId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('project_notifications')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Помилка при завантаженні сповіщень:', error);
      return;
    }

    setNotifications(data || []);
    setUnreadCount((data || []).filter(n => !n.read_at).length);
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('project_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Помилка при оновленні сповіщення:', error);
      return;
    }

    await fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, [projectId]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'deadline_week':
      case 'deadline_three_days':
      case 'deadline_day':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="font-medium">Сповіщення</div>
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-2">
                Немає сповіщень
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-2 rounded-lg transition-colors
                    ${notification.read_at ? 'bg-gray-50' : 'bg-blue-50 cursor-pointer'}
                  `}
                  onClick={() => !notification.read_at && markAsRead(notification.id)}
                >
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(notification.created_at), 'PPp', { locale: uk })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
