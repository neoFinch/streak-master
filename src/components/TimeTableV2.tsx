import {
  IonAvatar,
  IonButton,
  IonContent,
  IonDatetime,
  IonFooter,
  IonGrid,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonReorder,
  IonReorderGroup,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import "./TimeTableV2.css";
import { atCircle, refreshCircle } from "ionicons/icons";
import { use, useEffect, useRef } from "react";
import { createSwapy } from "swapy";
import { TaskV2, useTimeTableStoreV2, WeekDay } from "../store";
import { dayToNumber, getHourAndMinute } from "../utils/time-utils";
// import { animate, createScope, createSpring, createDraggable } from 'animejs'

function TimeTableV2() {
  let { slotGroup } = useTimeTableStoreV2();
  const timeTableRef = useRef<HTMLDivElement>(null);
  const modal = useRef<HTMLIonModalElement>(null);
  const titleRef = useRef<HTMLIonInputElement>(null);
  const startDayRef = useRef<HTMLIonSelectElement>(null);
  const startTimeRef = useRef<HTMLIonDatetimeElement>(null);
  const endDayRef = useRef<HTMLIonSelectElement>(null);
  const endTimeRef = useRef<HTMLIonDatetimeElement>(null);
  let scope = useRef<any>(null);
  // const root = useRef<HTMLDivElement>(null);

  const handleAddTimeSlot = () => {
    const title = titleRef.current?.value as string;
    const startDay = startDayRef.current?.value as WeekDay;
    const startTime = startTimeRef.current?.value as string;
    const endDay = endDayRef.current?.value as WeekDay;
    const endTime = endTimeRef.current?.value as string;

    console.log('startTime', getHourAndMinute( startTime )) ;
    console.log('endTime', getHourAndMinute(endTime));

    if (!title || !startDay || !startTime || !endDay || !endTime) {
      console.error("All fields are required");
      return;
    }

    const newTask: TaskV2 = {
      title,
      startDay,
      endDay,
    };

    const newSlot = {
      startTime: getHourAndMinute(startTime),
      endTime: getHourAndMinute(endTime),
      tasks: [newTask],
    };

    useTimeTableStoreV2.getState().addSlotContainer(newSlot);
    modal.current?.dismiss();
  };

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
              <div
                className="slot-and-task-container"
                key={`slot-` + index + `-task-` + taskIndex}
                style={{
                  gridColumn: `${dayToNumber[task.startDay]}/${
                    dayToNumber[task.endDay] + 1
                  }`,
                }}
              >
                <div className="time-slot">
                  {slot.startTime} - {slot.endTime}
                </div>
                <div className="task-container">
                  <div key={`task-` + taskIndex} className="task-title">
                    {task.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <IonButton id="open-modal" expand="full">
        Add Time Slot
      </IonButton>
      <IonModal
        ref={modal}
        trigger="open-modal"
        initialBreakpoint={0.95}
        breakpoints={[0, 0.25, 0.5, 0.75, 0.95]}
      >
        <IonContent className="ion-padding">
          <IonList>
            <IonItem>
              <IonButton
                fill="outline"
                slot="start"
                onClick={() => {
                  modal.current?.dismiss();
                }}
              >
                Cancel
              </IonButton>
              <IonButton
                slot="end"
                expand="block"
                onClick={() => {
                  handleAddTimeSlot()
                }}
              >
                Add Time Slot
              </IonButton>
            </IonItem>
            <IonItem className="">
              <IonInput ref={titleRef} placeholder="Title"></IonInput>
            </IonItem>
            <IonItem>
              <IonGrid>
                <IonSelect ref={startDayRef} placeholder="Start Day and Time">
                  <IonSelectOption value="mon">Monday</IonSelectOption>
                  <IonSelectOption value="tues">Tuesday</IonSelectOption>
                  <IonSelectOption value="wed">Wednesday</IonSelectOption>
                  <IonSelectOption value="thurs">Thursday</IonSelectOption>
                  <IonSelectOption value="fri">Friday</IonSelectOption>
                  <IonSelectOption value="sat">Saturday</IonSelectOption>
                  <IonSelectOption value="sun">Sunday</IonSelectOption>
                </IonSelect>
                <IonDatetime ref={startTimeRef} presentation="time"></IonDatetime>
              </IonGrid>
            </IonItem>
            <IonItem>
              <IonGrid>
                <IonSelect ref={endDayRef} placeholder="End Day and Time">
                  <IonSelectOption value="mon">Monday</IonSelectOption>
                  <IonSelectOption value="tues">Tuesday</IonSelectOption>
                  <IonSelectOption value="wed">Wednesday</IonSelectOption>
                  <IonSelectOption value="thurs">Thursday</IonSelectOption>
                  <IonSelectOption value="fri">Friday</IonSelectOption>
                  <IonSelectOption value="sat">Saturday</IonSelectOption>
                  <IonSelectOption value="sun">Sunday</IonSelectOption>
                </IonSelect>
                <IonDatetime ref={endTimeRef} presentation="time"></IonDatetime>
              </IonGrid>
            </IonItem>
          </IonList>
        </IonContent>
      </IonModal>
    </div>
  );
}

export default TimeTableV2;
