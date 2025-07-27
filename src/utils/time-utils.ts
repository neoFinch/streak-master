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

export const numberToDay: Record<number, WeekDay> = {
  1: "mon",
  2: "tues",
  3: "wed",
  4: "thurs",
  5: "fri",
  6: "sat",
  7: "sun",
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

export function formatTime(minutes: number) {
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
// output: "12:45 AM"
export const getHourAndMinute = (time: string) => {
  const date = new Date(time.replace("T", " "));
  let hours: string | number = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  if (hours > 12) {
    hours = hours - 12;
  }
  hours = hours.toString().padStart(2, "0");
  return `${hours}:${minutes} ${ampm}`;
}

/*
  input: "12:45 AM"
  output: 0.75
*/
export const convertDecimalToTime = (decimalTime: number) => {
  const hours24 = Math.floor(decimalTime);
  const minutesDecimal = decimalTime - hours24;

  const minutes = Math.round(minutesDecimal * 60);

  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const ampm = hours24 >= 12 ? "PM" : "AM";

  const paddedMinutes = minutes.toString().padStart(2, "0");

  return `${hours12}:${paddedMinutes} ${ampm}`;
}


// Helper function to convert day names to numbers (using your existing mapping)
const dayToNumberFunc = (day: string): number => {
  const normalizedDay = day.toLowerCase();
  // Map various day formats to your WeekDay format
  const dayMap: Record<string, WeekDay> = {
    'sun': 'sun', 'sunday': 'sun',
    'mon': 'mon', 'monday': 'mon',
    'tue': 'tues', 'tues': 'tues', 'tuesday': 'tues',
    'wed': 'wed', 'wednesday': 'wed',
    'thu': 'thurs', 'thurs': 'thurs', 'thursday': 'thurs',
    'fri': 'fri', 'friday': 'fri',
    'sat': 'sat', 'saturday': 'sat'
  };
  
  const weekDay = dayMap[normalizedDay];
  return weekDay ? dayToNumber[weekDay] : -1;
};

// Helper function to check if day ranges overlap (excluding adjacent ranges)
const doDayRangesOverlap = (newTask: any, existingTask: any): boolean => {
  const newStartDay = dayToNumberFunc(newTask.startDay);
  const newEndDay = dayToNumberFunc(newTask.endDay);
  const existingStartDay = dayToNumberFunc(existingTask.startDay);
  const existingEndDay = dayToNumberFunc(existingTask.endDay);
  
  if (newStartDay === -1 || newEndDay === -1 || existingStartDay === -1 || existingEndDay === -1) {
    return false; // Invalid day names
  }
  
  // Handle week wrapping (e.g., Fri-Mon means Fri, Sat, Sun, Mon)
  const normalizeRange = (start: number, end: number) => {
    if (start <= end) {
      return { start, end, wraps: false };
    } else {
      return { start, end, wraps: true };
    }
  };
  
  const newRange = normalizeRange(newStartDay, newEndDay);
  const existingRange = normalizeRange(existingStartDay, existingEndDay);
  
  console.log('Day range check:', {
    newRange: `${newTask.startDay}(${newStartDay})-${newTask.endDay}(${newEndDay})`,
    existingRange: `${existingTask.startDay}(${existingStartDay})-${existingTask.endDay}(${existingEndDay})`,
    newRangeNormalized: newRange,
    existingRangeNormalized: existingRange
  });
  
  // Check for overlap considering week wrapping, excluding adjacent ranges
  if (!newRange.wraps && !existingRange.wraps) {
    // Simple case: neither range wraps around the week
    const hasOverlap = newRange.start <= existingRange.end && newRange.end >= existingRange.start;
    
    // Check for adjacency: ranges are adjacent if they only share a boundary point
    // Case 1: One range ends exactly where the other starts (no shared days)
    const adjacentNoSharedDay = (newRange.end + 1 === existingRange.start) || (existingRange.end + 1 === newRange.start);
    
    // Case 2: Ranges share exactly one boundary day (like mon-tues and tues-wed sharing tues)
    const sharedBoundaryOnly = (newRange.start === existingRange.end) || (newRange.end === existingRange.start);
    
    const areAdjacent = adjacentNoSharedDay || sharedBoundaryOnly;
    
    console.log('Simple range check:', { 
      hasOverlap, 
      adjacentNoSharedDay, 
      sharedBoundaryOnly, 
      areAdjacent,
      ranges: `${newRange.start}-${newRange.end} vs ${existingRange.start}-${existingRange.end}`
    });
    return hasOverlap && !areAdjacent;
  } else if (newRange.wraps && !existingRange.wraps) {
    // New range wraps, existing doesn't
    // New range covers days from start to 7, and from 1 to end
    const overlapWithFirstPart = existingRange.start <= 7 && existingRange.end >= newRange.start;
    const overlapWithSecondPart = existingRange.start <= newRange.end && existingRange.end >= 1;
    const hasOverlap = overlapWithFirstPart || overlapWithSecondPart;
    
    // Check adjacency
    const adjacentToFirstPart = existingRange.end + 1 === newRange.start;
    const adjacentToSecondPart = newRange.end + 1 === existingRange.start;
    const areAdjacent = adjacentToFirstPart || adjacentToSecondPart;
    
    console.log('New wraps check:', { overlapWithFirstPart, overlapWithSecondPart, hasOverlap, areAdjacent });
    return hasOverlap && !areAdjacent;
  } else if (!newRange.wraps && existingRange.wraps) {
    // Existing range wraps, new doesn't
    // Existing range covers days from start to 7, and from 1 to end
    const overlapWithFirstPart = newRange.start <= 7 && newRange.end >= existingRange.start;
    const overlapWithSecondPart = newRange.start <= existingRange.end && newRange.end >= 1;
    const hasOverlap = overlapWithFirstPart || overlapWithSecondPart;
    
    // Check adjacency
    const adjacentToFirstPart = newRange.end + 1 === existingRange.start;
    const adjacentToSecondPart = existingRange.end + 1 === newRange.start;
    const areAdjacent = adjacentToFirstPart || adjacentToSecondPart;
    
    console.log('Existing wraps check:', { overlapWithFirstPart, overlapWithSecondPart, hasOverlap, areAdjacent });
    return hasOverlap && !areAdjacent;
  } else {
    // Both ranges wrap - they will always have some overlap since there are only 7 days
    // Check if they're only touching at one point
    const onlyTouchAtStart = newRange.end + 1 === existingRange.start;
    const onlyTouchAtEnd = existingRange.end + 1 === newRange.start;
    const areOnlyAdjacent = onlyTouchAtStart || onlyTouchAtEnd;
    
    console.log('Both wrap check:', { onlyTouchAtStart, onlyTouchAtEnd, areOnlyAdjacent });
    return !areOnlyAdjacent;
  }
};

export const checkCollision = (newSlot: any, existingSlots: any) => {
  console.log('------- Checking for collision -------');
  console.log('New Slot:', newSlot);
  console.log('Existing Slots:', existingSlots);
  
  for (const slot of existingSlots) {
    console.log('Checking against slot:', slot);
    
    let st = convertToMinutes(slot.startTime);
    let et = convertToMinutes(slot.endTime);
    let newSt = convertToMinutes(newSlot.startTime);
    let newEt = convertToMinutes(newSlot.endTime);

    console.log({ st, et, newSt, newEt });
    
    // Check for time overlap first (excluding adjacent times)
    const hasTimeOverlap = newSt < et && newEt > st;
    const areTimeAdjacent = newSt === et || newEt === st;
    const timeCollision = hasTimeOverlap && !areTimeAdjacent;
    
    if (!timeCollision) {
      console.log('No time collision, checking next slot');
      continue; // No time collision, check next slot
    }
    
    console.log('Time collision detected, checking day overlap...');
    
    // If there's a time collision, check if any tasks have overlapping days
    for (const newTask of newSlot.tasks) {
      for (const existingTask of slot.tasks) {
        const dayOverlap = doDayRangesOverlap(newTask, existingTask);
        console.log(`Day overlap result: ${dayOverlap}`);
        
        if (dayOverlap) {
          console.log('Both time and day collision detected');
          return true;
        }
      }
    }
    
    console.log('Time collision but no day overlap, continuing...');
  }
  
  console.log('No collision detected');
  return false;
};

// convert to minutes
export const convertToMinutes = (time: string) => {
  const [timePart, modifier] = time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }
  return hours * 60 + minutes; // return total minutes since midnight
}