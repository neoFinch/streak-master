import { create, StoreApi } from 'zustand';
import { persist } from "zustand/middleware"
import { EditingTask } from './components/TimeTableV2';



export type WeekDay = 'mon' | 'tues' | 'wed' | 'thurs' | 'fri' | 'sat' | 'sun';

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

export interface StreakCounterValue {
  count: number;
  logs: string[];
}

export type streakCounter = {
  [key: string]: StreakCounterValue;
}


export interface TimeTableV2Store {
  slotGroup: SlotGroup;
  streakCounter: streakCounter;
  setStreakCounter: (streakCounter: streakCounter) => void;
  addSlotContainer: (slot: SlotContainer) => void;
  removeSlotContainer: (startTime: string) => void;
  addTask: (task: TaskV2, slotIndex: number) => void;
  editTask: (
    editingTask: EditingTask,
    slotIndex: number,
    taskIndex: number,
  ) => void;
  deleteTask: (
    editingTask: EditingTask,
    slotIndex: number,
    taskIndex: number,
  ) => void;
}

let initialSlotGroup: SlotGroup = localStorage.getItem('timetable-storage-v2')
  ? JSON.parse(localStorage.getItem('timetable-storage-v2') || '').state.timetable?.slotGroup || []
  : [];


export const useTimeTableStoreV2 = create<TimeTableV2Store>()(
  persist(
    (set) => ({
      slotGroup: [...initialSlotGroup],
      streakCounter: {},
      setStreakCounter: (streakCounter: streakCounter) => {
        set((state) => ({
          streakCounter: streakCounter,
        }));
      },
      addSlotContainer: (slot: SlotContainer) => {
        // Check if the slot already exists
        console.log('adding slot:', slot);
        const exists = useTimeTableStoreV2.getState().slotGroup.some(
          (existingSlot) =>
            existingSlot.startTime === slot.startTime &&
            existingSlot.endTime === slot.endTime
        );
        // If it exists, do not add it again
        if (exists) {
          //  update the tasks in the existing slot
          console.warn('Slot already exists, updating tasks instead');
          useTimeTableStoreV2.getState().addTask(slot.tasks[0], 0);
          return;
        }
        set((state) => ({
          slotGroup: [...state.slotGroup, slot],
        }))
      },
      addTask: (task: TaskV2, slotIndex: number) => {
        set((state) => {
          let oldSlot = state.slotGroup[slotIndex];
          // check if there is a task exist for the same duration, if yes then overwrite it
          let taskExist = oldSlot.tasks.filter(
            (t) => t.startDay === task.startDay && t.endDay === task.endDay
          );
          if (taskExist.length > 0) {
            oldSlot.tasks = oldSlot.tasks.map((t) =>
              t.startDay === task.startDay && t.endDay === task.endDay ? task : t
            );
          }
          else {
            oldSlot.tasks.push(task);
            // sort the tasks by startDay
            oldSlot.tasks.sort((a, b) => {
              const daysOrder: WeekDay[] = ['mon', 'tues', 'wed', 'thurs', 'fri', 'sat', 'sun'];
              return daysOrder.indexOf(a.startDay) - daysOrder.indexOf(b.startDay);
            });
            
          }
          // return the new state
          return {
            slotGroup: state.slotGroup.map((slot, index) =>
              index === slotIndex ? oldSlot : slot
            ),
          };


        });
      },
      editTask: (
        editingTask: EditingTask,
        slotIndex: number,
        taskIndex: number,
      ) => {
        set((state) => {
          let oldSlot = state.slotGroup[slotIndex];
          let oldTask = oldSlot.tasks[taskIndex];
          //  check if startTime and endTime have changed
          // console.log({
          //   oldStartTime: oldSlot.startTime,
          //   oldEndTime: oldSlot.endTime,
          //   newStartTime: editingTask.startTime,
          //   newEndTime: editingTask.endTime
          // });

          if (oldSlot.startTime === editingTask.startTime &&
            oldSlot.endTime === editingTask.endTime) {
            // If they haven't changed, just update the task
            oldSlot.tasks[taskIndex] = {
              ...oldTask,
              title: editingTask.title,
              startDay: editingTask.startDay,
              endDay: editingTask.endDay,
            };
            // sort the tasks by startDay
            oldSlot.tasks.sort((a, b) => {
              const daysOrder: WeekDay[] = ['mon', 'tues', 'wed', 'thurs', 'fri', 'sat', 'sun'];
              return daysOrder.indexOf(a.startDay) - daysOrder.indexOf(b.startDay);
            });
            
            return {
              slotGroup: state.slotGroup.map((slot, index) =>
                index === slotIndex ? oldSlot : slot
              ),
            };
          } else {
            // if old slot container only 1 task then just change the startTime and endTime of slot 
            if (oldSlot.tasks.length === 1) {
              oldSlot.startTime = editingTask.startTime;
              oldSlot.endTime = editingTask.endTime;
              oldSlot.tasks[0] = {
                ...oldTask,
                title: editingTask.title,
                startDay: editingTask.startDay,
                endDay: editingTask.endDay,
              };
              return {
                slotGroup: state.slotGroup.map((slot, index) =>
                  index === slotIndex ? oldSlot : slot
                ),
              };
            } else {
              console.log('more than 1 task in slot, creating new slot and adding task');
              // delete the old task
              oldSlot.tasks = oldSlot.tasks.filter((_, index) => index !== taskIndex);
              // create a new slot with the new startTime and endTime
              let newSlot: SlotContainer = {
                startTime: editingTask.startTime,
                endTime: editingTask.endTime,
                tasks: [
                  {
                    title: editingTask.title,
                    startDay: editingTask.startDay,
                    endDay: editingTask.endDay,
                  },
                ],
              };
              // add the new slot to the slotGroup

              let newTimeTable: SlotContainer[] = state.slotGroup.map((slot, index) => {
                if (index === slotIndex) {
                  return oldSlot; // updated old slot
                }
                return slot; // keep the other slots unchanged
              });
              newTimeTable.push(newSlot); // add the new slot
              
              console.log('newTimeTable', newTimeTable);
              return {
                slotGroup: newTimeTable
              }
              // return {
              //   slotGroup: [
              //     // ...state.slotGroup.filter((_, index) => index !== slotIndex),
              //     oldSlot,
              //     newSlot,
              //   ],
              // };
            }
          }

          console.log('in editTask', { editingTask, oldTask });
          return state

        });
      },
      deleteTask: (
        editingTask: EditingTask,
        slotIndex: number,
        taskIndex: number,
      ) => {
        set((state) => {
          let oldSlot = state.slotGroup[slotIndex];
          // remove the task from the slot
          oldSlot.tasks = oldSlot.tasks.filter(
            (task, index) => index !== taskIndex
          );
          // if no tasks left in the slot, remove the slot
          if (oldSlot.tasks.length === 0) {
            return {
              slotGroup: state.slotGroup.filter((slot, index) => index !== slotIndex),
            };
          }
          // return the new state
          return {
            slotGroup: state.slotGroup.map((slot, index) =>
              index === slotIndex ? oldSlot : slot
            ),
          };
        });
      },
      removeSlotContainer: (startTime: string) =>
        set((state) => ({
          slotGroup: state.slotGroup.filter((slot) => slot.startTime !== startTime),
        })),
    }),
    {
      name: 'timetable-storage-v2', // Key in localStorage
    }
  ),

)