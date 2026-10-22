import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActivityEvent, ActivityEventType } from '../types/events';

interface ActivityState {
  events: ActivityEvent[];
  simulationCount: number;
  codeRunCount: number;
  notesSaveCount: number;
  addEvent: (type: ActivityEventType, appId: string, data: Record<string, unknown>) => void;
  clearEvents: () => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      events: [],
      simulationCount: 0,
      codeRunCount: 0,
      notesSaveCount: 0,
      addEvent: (type, appId, data) => set((state) => {
        const event: ActivityEvent = {
          id: crypto.randomUUID(),
          type,
          timestamp: new Date().toISOString(),
          data,
          appId,
        };
        return {
          events: [event, ...state.events].slice(0, 200),
          simulationCount: type === 'SIMULATION_RUN' ? state.simulationCount + 1 : state.simulationCount,
          codeRunCount: type === 'CODE_EXECUTED' ? state.codeRunCount + 1 : state.codeRunCount,
          notesSaveCount: type === 'NOTE_SAVED' ? state.notesSaveCount + 1 : state.notesSaveCount,
        };
      }),
      clearEvents: () => set({ events: [], simulationCount: 0, codeRunCount: 0, notesSaveCount: 0 }),
    }),
    { name: 'hkos-activity' }
  )
);
