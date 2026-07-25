'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, Salon } from '@/types';
import { DataStore } from '@/lib/store';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  salon: Salon;
  updateSalon: (salon: Salon) => void;
  bookingModalOpen: boolean;
  setBookingModalOpen: (open: boolean) => void;
  selectedServiceId: string | null;
  setSelectedServiceId: (id: string | null) => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('admin');
  const [salon, setSalonState] = useState<Salon>(DataStore.getSalon());
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const savedRole = DataStore.getUserRole();
    setRoleState(savedRole);
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    DataStore.setUserRole(newRole);
  };

  const updateSalon = (newSalon: Salon) => {
    setSalonState(newSalon);
    DataStore.updateSalon(newSalon);
  };

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        salon,
        updateSalon,
        bookingModalOpen,
        setBookingModalOpen,
        selectedServiceId,
        setSelectedServiceId,
        refreshKey,
        triggerRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
