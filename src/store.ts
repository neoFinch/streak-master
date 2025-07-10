import { create, StoreApi } from 'zustand';
import { persist } from "zustand/middleware"

export interface Task {
  id: number
  title: string
  completed: boolean
  timeStart: string
  timeEnd: string
  day: WeekDay
}

interface TimeTable {
  mon: Task[] | [];
  tues: Task[] | [];
  wed: Task[] | [];
  thurs: Task[] | [];
  fri: Task[] | [];
  sat: Task[] | [];
  sun: Task[] | [];
}

export type WeekDay = 'mon' | 'tues' | 'wed' | 'thurs' | 'fri' | 'sat' | 'sun';


export interface TimeTableStore {
  timetable: TimeTable;
  currentDay: WeekDay;
  setCurrentDay: (day: WeekDay) => void;
  addTask: (day: WeekDay, task: Task) => void;
  removeTask: (day: WeekDay, id: number) => void;
  updateTask: (day: WeekDay, updatedTask: Task) => void;
  toggleTask: (day: WeekDay, id: number) => void;
  setInitialTasks: (tasks: Task[], day: WeekDay) => void;
  batchDeleteTasks: (day: WeekDay, tasks: number[]) => void;
  batchAddTasks: (day: WeekDay, tasks: Task[]) => void;
}

export const useTimeTableStore = create<TimeTableStore>()(
  persist(
    (set) => ({
      timetable: {
        mon: [],
        tues: [],
        wed: [],
        thurs: [],
        fri: [],
        sat: [],
        sun: [],
      },
      currentDay: 'mon',
      setCurrentDay: (day: WeekDay) => set({ currentDay: day }),
      addTask: (day: WeekDay, task: Task) =>
        set((state) => ({
          timetable: {
            ...state.timetable,
            [day]: [...state.timetable[day], task],
          },
        })),
      removeTask: (day, taskId) =>
        set((state) => ({
          timetable: {
            ...state.timetable,
            [day]: state.timetable[day].filter((task) => task.id !== taskId),
          },
        })),
      toggleTask: (day, taskId) =>
        set((state) => ({
          timetable: {
            ...state.timetable,
            [day]: state.timetable[day].map((task) =>
              task.id === taskId
                ? { ...task, completed: !task.completed }
                : task
            ),
          },
        })),
      updateTask: (day, updatedTask) =>
        set((state) => ({
          timetable: {
            ...state.timetable,
            [day]: state.timetable[day].map((task) =>
              task.id === updatedTask.id ? updatedTask : task
            ),
          },
        })),
      setInitialTasks: (tasks, day) =>
        set((state) => ({
          timetable: {
            ...state.timetable,
            [day]: tasks,
          },
        })),
      batchDeleteTasks: (day, tasks) =>
        set((state) => ({
          timetable: {
            ...state.timetable,
            [day]: state.timetable[day].filter(
              (task) => !tasks.includes(task.id)
            ),
          },
        })),
      batchAddTasks: (day, tasks) =>
        set((state) => ({
          timetable: {
            ...state.timetable,
            [day]: [...state.timetable[day], ...tasks],
          },
        })),
    }),
    {
      name: 'timetable-storage', // Key in localStorage
      partialize: (state) => ({ timetable: state.timetable }), // Optional: if you only want to persist part of the state
    }
  )
);

// V2 store

export interface TaskV2 {
  title: string;
  startDay: WeekDay;
  endDay: WeekDay;
}

export interface SlotContainer {
  startTime: string;
  endTime: string;
  tasks: TaskV2[];
}

export type SlotGroup = SlotContainer[];

export interface TimeTableV2Store {
  slotGroup: SlotGroup;
  addSlotContainer: (slot: SlotContainer) => void;
  removeSlotContainer: (startTime: string) => void;

}

let initialSlotGroup: SlotGroup = localStorage.getItem('timetable-storage-v2')
  ? JSON.parse(localStorage.getItem('timetable-storage-v2') || '').state.timetable?.slotGroup || []
  : [];


export const useTimeTableStoreV2 = create<TimeTableV2Store>()(
  persist(
    (set) => ({
      slotGroup: [...initialSlotGroup],
      addSlotContainer: (slot: SlotContainer) => {
        // Check if the slot already exists
        const exists = useTimeTableStoreV2.getState().slotGroup.some(
          (existingSlot) =>
            existingSlot.startTime === slot.startTime &&
            existingSlot.endTime === slot.endTime
        );
        // If it exists, do not add it again
        if (exists) {
          //  update the tasks in the existing slot
          set((state) => ({
            slotGroup: state.slotGroup.map((existingSlot) =>
              existingSlot.startTime === slot.startTime &&
              existingSlot.endTime === slot.endTime
                ? {
                    ...existingSlot,
                    tasks: [...existingSlot.tasks, ...slot.tasks],
                  }
                : existingSlot
            ),
          }));
          return;
        }
        set((state) => ({
          slotGroup: [...state.slotGroup, slot],
        }))
      },
      removeSlotContainer: (startTime: string) =>
        set((state) => ({
          slotGroup: state.slotGroup.filter((slot) => slot.startTime !== startTime),  
        })),
    }),
    {
      name: 'timetable-storage-v2', // Key in localStorage
      // partialize: (state) => ({ timetable: state }), // Optional: if you only want to persist part of the state
    }
  ),

)