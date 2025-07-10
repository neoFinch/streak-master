import { WeekDay } from "../store";

export const dayToNumber: Record<WeekDay, number> = {
  mon: 1,
  tues: 2,
  wed: 3,
  thurs: 4,
  fri: 5,
  sat: 6,
  sun: 7,
};

export function sortTimeRanges(timeRanges: string[]) {
  function parseTime(timeStr: string) {
    // Create a date object to parse time correctly
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes; // return total minutes since midnight
  }

  return timeRanges.sort((a, b) => {
    const startA = parseTime(a.split(' - ')[0]);
    const startB = parseTime(b.split(' - ')[0]);
    return startA - startB;
  });
}

export  function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours < 12 ? "AM" : "PM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}${period}`;
}

export const getFullDayName = (day: WeekDay) => {
  switch (day) {
    case "mon":
      return "Monday";
    case "tues":
      return "Tuesday";
    case "wed":
      return "Wednesday";
    case "thurs":
      return "Thursday";
    case "fri":
      return "Friday";
    case "sat":
      return "Saturday";
    case "sun": 
      return "Sunday";
  }
};

// input: "2025-07-11T00:45:00"
export const getHourAndMinute = (time: string) => {
  const date = new Date(time);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}