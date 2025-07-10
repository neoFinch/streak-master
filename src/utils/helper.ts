import { Task, WeekDay } from "../store";
import { formatTime } from "./time-utils";

export const generateTimeRangeTemplate = (slotLength: number, day: WeekDay): Array<Task> => {
  const timeRange: Array<Task> = [];
  for (let i = 0; i < 24 * 60; i += slotLength) {
    timeRange.push({
      id: i,
      title: "",
      completed: false,
      timeStart: formatTime(i),
      timeEnd: formatTime(i + slotLength),
      day: day,
    });
  }
  return timeRange;
}