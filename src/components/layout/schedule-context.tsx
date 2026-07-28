"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ScheduleContextType {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  return (
    <ScheduleContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
}
