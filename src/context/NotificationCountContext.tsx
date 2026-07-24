import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface NotificationCountContextType {
  notificationCount: number;
  setNotificationCount: (count: number) => void;
  incrementNotificationCount: () => void;
  decrementNotificationCount: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const NotificationCountContext = createContext<NotificationCountContextType | undefined>(undefined);

export const NotificationCountProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const incrementNotificationCount = useCallback(() => {
    setNotificationCount(prev => prev + 1);
  }, []);

  const decrementNotificationCount = useCallback(() => {
    setNotificationCount(prev => Math.max(0, prev - 1));
  }, []);

  return (
    <NotificationCountContext.Provider
      value={{
        notificationCount,
        setNotificationCount,
        incrementNotificationCount,
        decrementNotificationCount,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </NotificationCountContext.Provider>
  );
};

export const useNotificationCountContext = () => {
  const context = useContext(NotificationCountContext);
  if (context === undefined) {
    throw new Error('useNotificationCountContext must be used within a NotificationCountProvider');
  }
  return context;
};
