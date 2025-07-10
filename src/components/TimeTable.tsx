import {
  IonCol,
  IonFab,
  IonFabButton,
  IonGrid,
  IonIcon,
  IonLabel,
  IonRow,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import { Task, useTimeTableStore, WeekDay } from "../store";
import { useState, useRef, useEffect } from "react";
import { add, bookOutline } from "ionicons/icons";
import { formatTime, getFullDayName } from "../utils/time-utils";
import { generateTimeRangeTemplate } from "../utils/helper";
import { ModalComponent } from "./ModalComponent";

export const TimeTable = () => {
  const slotLength = 30;
  const { timetable, setCurrentDay, setInitialTasks } = useTimeTableStore();
  const currentDay = useTimeTableStore((state) => state.currentDay);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  
  // Initialize or update local tasks when the day changes or when timetable updates
  useEffect(() => {
    const dayTasks = timetable[currentDay];
    if (dayTasks.length === 0) {
      const newTasks = generateTimeRangeTemplate(slotLength, currentDay);
      setInitialTasks(newTasks, currentDay);
      setLocalTasks(newTasks);
    } else {
      // Always update localTasks when timetable changes
      setLocalTasks(dayTasks);
    }
  }, [currentDay, timetable, setInitialTasks]); // Keep timetable in dependencies

  // Alternative approach: Remove localTasks and use timetable directly
  // This ensures UI always reflects the store state
  const currentDayTasks = timetable[currentDay];

  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [startRow, setStartRow] = useState<number | null>(null);

  const isSelectingRef = useRef(false);
  const activeTouchesRef = useRef<Map<number, { x: number; y: number }>>(
    new Map()
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const rowElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Set up non-passive touch event listeners
  useEffect(() => {
    const handleTouchStartNonPassive = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const rowWrapper = target.closest(".row-wrapper") as HTMLDivElement;
      if (!rowWrapper) return;

      console.log("Touch start - fingers:", e.touches.length);

      // Update active touches
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        activeTouchesRef.current.set(touch.identifier, {
          x: touch.clientX,
          y: touch.clientY,
        });
      }

      // If 2 or more fingers, disable selection and enable scrolling
      if (e.touches.length >= 2) {
        isSelectingRef.current = false;
        return;
      }

      // Single finger - start selection
      if (e.touches.length === 1) {
        e.preventDefault();
        e.stopPropagation();

        isSelectingRef.current = true;
        const id = parseInt(rowWrapper.id, 10);
        console.log("touch start selection", id);

        setStartRow(id);
        setSelectedRows(new Set([id]));
      }
    };

    const handleTouchMoveNonPassive = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const rowWrapper = target.closest(".row-wrapper");
      if (!rowWrapper) return;

      // Update active touches
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        activeTouchesRef.current.set(touch.identifier, {
          x: touch.clientX,
          y: touch.clientY,
        });
      }

      // If 2 or more fingers, handle scrolling
      if (e.touches.length >= 2) {
        isSelectingRef.current = false;

        // Calculate vertical movement for scrolling
        const touches = Array.from(e.touches);
        const avgY =
          touches.reduce((sum, touch) => sum + touch.clientY, 0) /
          touches.length;

        if (lastScrollY.current !== 0) {
          const deltaY = lastScrollY.current - avgY;

          // Scroll the container
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop += deltaY;
          }
        }

        lastScrollY.current = avgY;
        return;
      }

      // Single finger - handle selection
      if (
        e.touches.length === 1 &&
        isSelectingRef.current &&
        startRow !== null
      ) {
        e.preventDefault();
        e.stopPropagation();

        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!element) return;

        const rowElement = element.closest(".row-wrapper") as HTMLDivElement;
        if (!rowElement || !rowElement.id) return;

        const id = parseInt(rowElement.id, 10);
        console.log("touch move selection", id);

        // Select range from start to current
        const minRow = Math.min(startRow, id);
        const maxRow = Math.max(startRow, id);
        const newSelection = new Set<number>();

        for (let i = minRow; i <= maxRow; i++) {
          newSelection.add(i);
        }

        setSelectedRows(newSelection);
      }
    };

    const handleTouchEndNonPassive = (e: TouchEvent) => {
      console.log("Touch end - remaining fingers:", e.touches.length);

      // Remove ended touches
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        activeTouchesRef.current.delete(touch.identifier);
      }

      // If no more touches, end selection
      if (e.touches.length === 0) {
        isSelectingRef.current = false;
        lastScrollY.current = 0;
        console.log("touch end selection");
      }

      // If back to single finger, restart selection
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const rowElement = element?.closest(".row-wrapper") as HTMLDivElement;

        if (rowElement && rowElement.id) {
          const id = parseInt(rowElement.id, 10);
          setStartRow(id);
          setSelectedRows(new Set([id]));
          isSelectingRef.current = true;
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("touchstart", handleTouchStartNonPassive, {
        passive: false,
      });
      container.addEventListener("touchmove", handleTouchMoveNonPassive, {
        passive: false,
      });
      container.addEventListener("touchend", handleTouchEndNonPassive, {
        passive: false,
      });
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStartNonPassive);
        container.removeEventListener("touchmove", handleTouchMoveNonPassive);
        container.removeEventListener("touchend", handleTouchEndNonPassive);
      }
    };
  }, [startRow]); // Add startRow as dependency

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // This is now handled by the non-passive event listeners above
    // Keep this empty to avoid conflicts
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // This is now handled by the non-passive event listeners above
    // Keep this empty to avoid conflicts
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    // This is now handled by the non-passive event listeners above
    // Keep this empty to avoid conflicts
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Skip if this is a touch event (handled by touch events)
    if (e.pointerType === "touch") return;

    e.preventDefault();
    e.stopPropagation();

    isSelectingRef.current = true;
    const id = parseInt(e.currentTarget.id, 10);
    console.log("pointer down", id);

    setStartRow(id);
    setSelectedRows(new Set([id]));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Skip if this is a touch event (handled by touch events)
    if (e.pointerType === "touch") return;

    e.preventDefault();
    e.stopPropagation();

    if (!isSelectingRef.current || startRow === null) return;

    // Use elementFromPoint to find the actual element under the pointer
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element) return;

    // Find the closest row wrapper
    const rowElement = element.closest(".row-wrapper");
    if (!rowElement || !rowElement.id) return;

    const id = parseInt(rowElement.id, 10);
    console.log("pointer move", id);

    // Select range from start to current
    const minRow = Math.min(startRow, id);
    const maxRow = Math.max(startRow, id);
    const newSelection = new Set<number>();

    for (let i = minRow; i <= maxRow; i++) {
      newSelection.add(i);
    }

    setSelectedRows(newSelection);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    // Skip if this is a touch event (handled by touch events)
    if (e.pointerType === "touch") return;

    e.preventDefault();
    e.stopPropagation();

    isSelectingRef.current = false;
    console.log("pointer up", e.currentTarget.id);
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    // Skip if this is a touch event (handled by touch events)
    if (e.pointerType === "touch") return;

    e.preventDefault();
    e.stopPropagation();

    if (!isSelectingRef.current || startRow === null) return;

    const id = parseInt(e.currentTarget.id, 10);
    console.log("pointer enter", id);

    // Select range from start to current
    const minRow = Math.min(startRow, id);
    const maxRow = Math.max(startRow, id);
    const newSelection = new Set<number>();

    for (let i = minRow; i <= maxRow; i++) {
      newSelection.add(i);
    }

    setSelectedRows(newSelection);
  };

  const groupAndAddTask = () => {
    console.log("group and add task");
    const selectedRowsArray = Array.from(selectedRows);
    const selectedRowsArraySorted = selectedRowsArray.sort((a, b) => a - b);
    const selectedRowsArraySortedFormatted = selectedRowsArraySorted.map(
      (row) => formatTime(row * slotLength)
    );
    console.log(selectedRowsArraySortedFormatted);
  };

  // Function to handle modal close and clear selection
  const handleModalClose = () => {
    setSelectedRows(new Set());
    setStartRow(null);
  };

  // Use currentDayTasks directly instead of localTasks
  const tasksToRender = currentDayTasks.length > 0 ? currentDayTasks : localTasks;

  return (
    <>
      <IonSegment scrollable={true} value={currentDay}>
        {Object.keys(timetable).map((day, index) => (
          <IonSegmentButton
            key={index}
            value={day}
            onClick={(e) => setCurrentDay(day as WeekDay)}
          >
            {day.toUpperCase()}
          </IonSegmentButton>
        ))}
      </IonSegment>
      <IonGrid className="ion-padding time-table-task">
        <IonRow>
          <IonCol size="5" className="ion-text-center">
            <IonLabel className="ion-text-center">Time</IonLabel>
          </IonCol>
          <IonCol className="ion-text-center">
            <IonLabel>Task</IonLabel>
          </IonCol>
        </IonRow>
        <div
          ref={scrollContainerRef}
          style={{
            userSelect: "none",
            touchAction: "none",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {tasksToRender.map((task: Task, index: number) => {
            return (
              <div
                key={`${index}-${task.id}`}
                id={`${index}`}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerMove={handlePointerMove}
                onPointerEnter={handlePointerEnter}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`row-wrapper ${
                  selectedRows.has(index) ? "selected-row" : ""
                }`}
              >
                <IonRow>
                  <IonCol size="5">
                    <IonLabel>
                      <h6 style={{ fontSize: "12px", margin: 0 }}>
                        {task.timeStart} - {task.timeEnd}
                      </h6>
                    </IonLabel>
                  </IonCol>
                  <IonCol className="ion-text-center">
                    {task.title || "-"}
                  </IonCol>
                </IonRow>
              </div>
            );
          })}
        </div>
      </IonGrid>
      {selectedRows.size > 0 && (
        <div className="selected-slots-indicator">
          Selected: {selectedRows.size} slots
        </div>
      )}
      <IonFab
        slot="fixed"
        vertical="bottom"
        horizontal="end"
        onClick={groupAndAddTask}
      >
        <IonFabButton size="small" id="open-modal">
          <IonIcon icon={add}></IonIcon>
        </IonFabButton>
      </IonFab>
      <ModalComponent rows={selectedRows} onClose={handleModalClose} />
    </>
  );
};