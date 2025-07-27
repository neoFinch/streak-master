import { IonAlert, IonIcon } from "@ionic/react";
import "./TimeTableV2.css";
import { addCircleOutline } from "ionicons/icons";
import { use, useEffect, useRef, useState } from "react";
import { TaskV2, useTimeTableStoreV2, WeekDay } from "../store";
import {
  checkCollision,
  dayToNumber,
  getHourAndMinute,
  numberToDay,
} from "../utils/time-utils";
import { ModalComponentV2 } from "./ModalComponentV2";
import { SlotComponent } from "./SlotComponent";
import { Bounce, toast, ToastContainer } from "react-toastify";

export interface EditingTask extends TaskV2 {
  startTime: string;
  endTime: string;
}

function TimeTableV2() {
  let { slotGroup } = useTimeTableStoreV2();
  const timeTableRef = useRef<HTMLDivElement>(null);
  const smallModal = useRef<HTMLIonModalElement>(null);
  const titleRef = useRef<HTMLIonInputElement>(null);
  // const startHourRef = useRef<HTMLIonSelectElement>(null);
  // const startMinRef = useRef<HTMLIonSelectElement>(null);
  // const endHourRef = useRef<HTMLIonSelectElement>(null);
  // const endMinRef = useRef<HTMLIonSelectElement>(null);
  const startTimeRef = useRef<HTMLIonDatetimeElement>(null);
  const endTimeRef = useRef<HTMLIonDatetimeElement>(null);

  const dayRangeRef = useRef<HTMLIonRangeElement>(null);
  const amPmRef = useRef<HTMLSelectElement>(null);

  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [editingTaskStartTime, setEditingTaskStartTime] = useState<
    string | null
  >(null);
  const [editingTaskEndTime, setEditingTaskEndTime] = useState<string | null>(
    null
  );

  useEffect(() => {
    let rootCss = document.querySelector(":root") as HTMLElement;
    let gridRows = getComputedStyle(rootCss).getPropertyValue("--grid-rows");
    console.log("gridRows: ", gridRows);
    rootCss.style.setProperty("--grid-rows", `${slotGroup.length}`);
  }, [slotGroup]);

  const handleDayRangeChange = (e: CustomEvent) => {
    const value = e.detail.value as { lower: number; upper: number };
    // setDayRange(value);
    console.log("Day Range Changed:", value);
    console.log("Day Range Ref:", dayRangeRef.current);
    if (dayRangeRef.current) {
      console.log(`${value.lower},${value.upper}`);
    }
  };

  const handleAddTimeSlot = () => {
    setEditingTask(null);
    setEditingSlotIndex(null);
    setEditingTaskIndex(null);
    const title = titleRef.current?.value as string;
    let start = startTimeRef.current?.value as string;
    let end = endTimeRef.current?.value as string;

    let dayRangeValues = dayRangeRef.current
      ? (dayRangeRef.current.value as { lower: number; upper: number })
      : { lower: 1, upper: 2 };

    if (!title || !start || !end) {
      console.error("All fields are required");
      toast.warn("All fields are required", {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      return;
    }

    const newTask: TaskV2 = {
      title,
      startDay: numberToDay[dayRangeValues.lower],
      endDay: numberToDay[dayRangeValues.upper],
    };

    let startTime = getHourAndMinute(start);
    let endTime = getHourAndMinute(end);
    console.log({
      startTime,
      endTime,
    });

    if (startTime === endTime) {
      console.error("Start time and end time cannot be the same");
      toast.warn("Start time and end time cannot be the same", {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      return;
    }

    const newSlot = {
      startTime: startTime,
      endTime: endTime,
      tasks: [newTask],
    };

    console.log({ newSlot });

    // check for collisions
    // if (checkCollision(newSlot, slotGroup)) {
    //   console.error("Collision detected");
    //   toast.warn("Time slot already booked", {
    //     position: 'top-center',
    //     autoClose: 5000,
    //     hideProgressBar: false,
    //     closeOnClick: false,
    //     pauseOnHover: true,
    //     draggable: true,
    //     progress: undefined,
    //     theme: "dark",
    //     transition: Bounce,
    //   });
    //   return;
    // }

    useTimeTableStoreV2.getState().addSlotContainer(newSlot);
    smallModal.current?.dismiss();
  };

  const handleEditTimeSlot = (task: TaskV2) => {
    if (editingTask) {
      // console.log("Editing Task:", editingTask);
      let amPm = amPmRef.current?.value as string;
      let title = titleRef.current?.value as string;
      let start = startTimeRef.current?.value as string;
      let end = endTimeRef.current?.value as string;

      let startTime = getHourAndMinute(start);
      let endTime = getHourAndMinute(end);
      console.log({
        startTime,
        endTime,
      });

      let dayRangeValues = dayRangeRef.current
        ? (dayRangeRef.current.value as { lower: number; upper: number })
        : { lower: 1, upper: 2 };

      

      let newTask: EditingTask = {
        ...editingTask,
        title: title,
        startDay: numberToDay[dayRangeValues.lower],
        endDay: numberToDay[dayRangeValues.upper],
        startTime: startTime,
        endTime: endTime,
      };

      if ( checkCollision(newTask, slotGroup) ) {
        console.error("Collision detected");
        toast.warn("Time slot already booked", {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
        return;
      }

      useTimeTableStoreV2
        .getState()
        .editTask(
          newTask,
          editingSlotIndex as number,
          editingTaskIndex as number
        );
      smallModal.current?.dismiss();
      setEditingTask(null);
      setEditingSlotIndex(null);
      setEditingTaskIndex(null);
    }
  };

  const handleDeleteTimeSlot = () => {
    if (editingTask && editingSlotIndex !== null && editingTaskIndex !== null) {
      // are you sure you want to delete this task?
      let userConfirmed = window.confirm(
        `Are you sure you want to delete the task "${editingTask.title}"?`
      );
      if (!userConfirmed) {
        return;
      }
      console.log("Deleting Task:", editingTask);

      useTimeTableStoreV2
        .getState()
        .deleteTask(editingTask, editingSlotIndex, editingTaskIndex);
      smallModal.current?.dismiss();
      setEditingTask(null);
      setEditingSlotIndex(null);
      setEditingTaskIndex(null);
    }
  };

  const openModelForEdit = (
    task: EditingTask | TaskV2, // TaskV2 + startTime: string, endTime: string,
    slot: { startTime: string; endTime: string; tasks: TaskV2[] },
    slotIndex: number,
    taskIndex: number
  ) => {
    console.log({ slot });

    setEditingTask({
      ...task,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }); // Store the task to edit
    setEditingSlotIndex(slotIndex);
    setEditingTaskIndex(taskIndex);
    // setEditingTaskStartTime(slot.startTime);
    // setEditingTaskEndTime(slot.endTime);
    smallModal.current?.present(); // Open the modal
  };

  useEffect(() => {
    console.log({ editingTask });
  }, [editingTask]);

  return (
    <div ref={timeTableRef} className="time-table-container">
      <div className="vertical-days-container">
        <div className="vertical-day-label">M</div>
        <div className="vertical-day-label">T</div>
        <div className="vertical-day-label">W</div>
        <div className="vertical-day-label">T</div>
        <div className="vertical-day-label">F</div>
        <div className="vertical-day-label">S</div>
        <div className="vertical-day-label">S</div>
      </div>
      <div className="time-grid-container">
        {slotGroup.map((slot, index) => (
          <div
            className="time-slot-container"
            key={index}
            style={{
              gridColumn: "1/8",
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
            }}
          >
            {slot.tasks.map((task, taskIndex) => (
              <SlotComponent
                key={`slot-` + index + `-task-` + taskIndex}
                index={index}
                taskIndex={taskIndex}
                task={task}
                slot={slot}
                openModelForEdit={openModelForEdit}
              />
            ))}
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          setEditingTask(null);
        }}
        className="add-slot-button"
        id="open-small-modal"
      >
        {" "}
        <IonIcon
          size="large
          "
          icon={addCircleOutline}
        ></IonIcon>{" "}
        Add Habit
      </button>

      <ModalComponentV2
        // amPm={amPm}
        amPmRef={amPmRef}
        modalRef={smallModal}
        titleRef={titleRef}
        // dayRange={dayRange}
        dayRangeRef={dayRangeRef}
        startTimeRef={startTimeRef}
        endTimeRef={endTimeRef}
        editingTask={editingTask}
        // setAmPm={setAmPm}
        handleDayRangeChange={handleDayRangeChange}
        handleAddTimeSlot={handleAddTimeSlot}
        handleEditTimeSlot={handleEditTimeSlot}
        handleDeleteTimeSlot={handleDeleteTimeSlot}
      />
    </div>
  );
}

export default TimeTableV2;
