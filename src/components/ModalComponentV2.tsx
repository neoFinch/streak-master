import {
  IonButton,
  IonCol,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonRange,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
} from "@ionic/react";
import {
  convertDecimalToTime,
  dayToNumber,
  numberToDay,
} from "../utils/time-utils";
import { use, useEffect } from "react";
import { TaskV2 } from "../store";
import { EditingTask } from "./TimeTableV2";

export interface ModalComponentV2Props {
  handleAddTimeSlot: () => void;
  handleEditTimeSlot?: (task: TaskV2) => void;
  handleDayRangeChange: (event: CustomEvent) => void;
  setAmPm?: (value: string) => void;
  handleDeleteTimeSlot: () => void;
  dayRange?: { lower: number; upper: number };
  dayRangeRef: any;
  amPm?: string;
  amPmRef: any;
  modalRef: React.RefObject<HTMLIonModalElement | null>;
  titleRef: React.RefObject<HTMLIonInputElement | null>;
  startTimeRef: React.RefObject<HTMLIonDatetimeElement | null>;
  endTimeRef: React.RefObject<HTMLIonDatetimeElement | null>;
  editingTask?: EditingTask | null;
}

export const ModalComponentV2 = ({
  handleAddTimeSlot,
  handleDayRangeChange,
  dayRange,
  amPm,
  setAmPm,
  modalRef,
  titleRef,
  startTimeRef,
  endTimeRef,
  editingTask = null,
  dayRangeRef,
  amPmRef,
  handleEditTimeSlot = () => {},
  handleDeleteTimeSlot = () => {},
}: ModalComponentV2Props) => {
  let hours = Array.from({ length: 12 }, (_, i) => i + 1);
  let minutes = [0, 15, 30, 45, 60];
  // Create date objects with local time for 7:00 AM and 8:00 AM
  const getLocalISOString = (hours: number, mins = 0) => {
    const date = new Date();
    date.setHours(hours, mins, 0, 0);
    // Get the timezone offset in minutes and convert to milliseconds
    const tzOffset = date.getTimezoneOffset() * 60000;
    // Create a new date that accounts for the timezone offset
    const localDate = new Date(date.getTime() - tzOffset);
    // Return as ISO string and remove the 'Z' to indicate local time
    return localDate.toISOString().slice(0, -1);
  };

  let defaultStartTime = getLocalISOString(7); // 7:00 AM
  let defaultEndTime = getLocalISOString(8); // 8:00 AM
  
  if (editingTask) {
    console.log('in editingTask:', editingTask);
    let startHrs = parseInt(editingTask.startTime.split(":")[0]);
    let startMins = parseInt(editingTask.startTime.split(":")[1]);
    let startAmPm = editingTask.startTime.split(" ")[1];
    if (startAmPm === "PM" && startHrs < 12) {
      startHrs += 12; // Convert PM to 24-hour format
    } else if (startAmPm === "AM" && startHrs === 12) {
      startHrs = 0; // Convert 12 AM to 0 hours
    }
    console.log('startHrs:', startHrs, 'startMins:', startMins);
    defaultStartTime = getLocalISOString(startHrs, startMins);


    let endHrs = parseInt(editingTask.endTime.split(":")[0]);
    let endMins = parseInt(editingTask.endTime.split(":")[1]);
    let endAmPm = editingTask.endTime.split(" ")[1];
    if (endAmPm === "PM" && endHrs < 12) {
      endHrs += 12; // Convert PM to 24-hour format
    } else if (endAmPm === "AM" && endHrs === 12) {
      endHrs = 0; // Convert 12 AM to 0 hours
    }
    console.log('endHrs:', endHrs, 'endMins:', endMins);

    defaultEndTime = getLocalISOString(endHrs, endMins);
    console.log('defaultEndTime:', defaultEndTime);
  }

  

  useEffect(() => {
    console.log({ editingTask, dayRange });
  }, []);

  // const handleRadioChange = (e: CustomEvent) => {
  //   if (amPmRef) {
  //     console.log("AM/PM changed", amPmRef?.current?.value);
  //   }
  // };

  return (
    <IonModal
      ref={modalRef}
      trigger="open-small-modal"
      initialBreakpoint={0.80}
      breakpoints={[0, 0.90]}
      onDidPresent={() => {
        console.log("Modal presented");
        if (editingTask && titleRef.current) {
          console.log(
            "EditineditingTask.startTime :",
            editingTask.startTime.split(":")[0]
          );
          titleRef.current.value = editingTask.title;
          // amPmRef.current.value = editingTask.startTime.split(":")[2];
        }

        // if (startTimeRef.current) {
        //   startTimeRef.current.value = editingTask ? editingTask.startTime : defaultStartTime;
        // }
        // if (endTimeRef.current) {
        //   endTimeRef.current.value = editingTask ? editingTask.endTime : defaultEndTime;
        // }
      }}
    >
      <IonContent className="ion-padding-top">
        <IonItem>
          <IonTitle className="ion-text-center">
            {editingTask ? "Edit Habit" : "Add Habit"}
          </IonTitle>
        </IonItem>
        <IonItem className="">
          <IonButton
            fill="outline"
            slot="start"
            onClick={() => {
              modalRef?.current?.dismiss();
            }}
          >
            Cancel
          </IonButton>
          {editingTask ? (
            <IonButton
              slot="end"
              expand="block"
              onClick={() => handleEditTimeSlot(editingTask)}
            >
              Update
            </IonButton>
          ) : (
            <IonButton slot="end" expand="block" onClick={handleAddTimeSlot}>
              Save
            </IonButton>
          )}
        </IonItem>
        <IonItem className="ion-padding-top">
          <IonInput
            autoFocus
            fill="solid"
            labelPlacement="floating"
            ref={titleRef}
            onFocus={() => {
              modalRef.current?.setCurrentBreakpoint(0.75);
            }}
          >
            <div slot="label">
              Habit Name <IonText color="danger">(Required)</IonText>
            </div>
          </IonInput>
        </IonItem>
        <IonItem className="">
          <IonRange
            className=" ion-margin-top ion-margin-bottom"
            onIonChange={handleDayRangeChange}
            ref={dayRangeRef}
            aria-label="select day"
            dualKnobs={true}
            ticks={true}
            pin={true}
            snaps={true}
            pinFormatter={(value) => {
              const day = numberToDay[value];
              return `${day}`;
            }}
            min={1}
            max={7}
            step={1}
            value={{
              lower: editingTask
                ? dayToNumber[editingTask.startDay]
                : dayRangeRef.current
                ? dayRangeRef.current.value.lower
                : 1,
              upper: editingTask
                ? dayToNumber[editingTask.endDay]
                : dayRangeRef.current
                ? dayRangeRef.current.value.upper
                : 2,
            }}
          >
            <IonLabel slot="start">From</IonLabel>
            <IonLabel slot="end">To</IonLabel>
          </IonRange>
        </IonItem>

        <IonItem className="">
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonLabel className="ion-padding-start">Start</IonLabel>
                <IonDatetimeButton datetime="datetime1"></IonDatetimeButton>
              </IonCol>
              <IonCol>
                <IonLabel className="ion-padding-start">End</IonLabel>
                <IonDatetimeButton datetime="datetime2"></IonDatetimeButton>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonModal keepContentsMounted={true}>
            <IonDatetime
              value={defaultStartTime}
              id="datetime1"
              presentation="time"
              hourCycle="h12"
              minuteValues="0,15,30,45"
              onIonChange={(e) => console.log(e.detail.value)}
              ref={startTimeRef}
            />
          </IonModal>
          <IonModal keepContentsMounted={true}>
            <IonDatetime
              value={defaultEndTime}
              id="datetime2"
              presentation="time"
              hourCycle="h12"
              minuteValues="0,15,30,45"
              onIonChange={(e) => console.log(e.detail.value)}
              ref={endTimeRef}
            />
          </IonModal>
        </IonItem>

        {editingTask && (
          <IonItem>
            <IonButton
              color="danger"
              fill="outline"
              onClick={() => handleDeleteTimeSlot()}
            >
              <IonText>Delete Task</IonText>
            </IonButton>
          </IonItem>
        )}
      </IonContent>
    </IonModal>
  );
};
