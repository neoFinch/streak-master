import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import { formatTime, getFullDayName } from "../utils/time-utils";
import { bookOutline, close, save, time } from "ionicons/icons";
import { Task, useTimeTableStore } from "../store";

interface ModalComponentProps {
  rows: Set<number>;
  onClose: () => void;
}

export const ModalComponent: React.FC<ModalComponentProps> = ({ rows, onClose }) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const page = useRef(undefined);
  const { addTask, batchDeleteTasks, setInitialTasks, timetable } = useTimeTableStore();
  let currentDay = useTimeTableStore((state) => state.currentDay);
  let inputRef = useRef<HTMLIonInputElement>(null);

  const [presentingElement, setPresentingElement] = useState<
    HTMLElement | undefined
  >(undefined);

  useEffect(() => {
    console.log("modal mount");
    setPresentingElement(page.current);
  }, []);

  function dismiss() {
    modal.current?.dismiss();
  }

  const saveTask = () => {
    console.log("save task");
    console.log(inputRef.current?.value);

    const selectedRowsArray = Array.from(rows).sort((a, b) => a - b);
    
    if (!inputRef.current?.value || selectedRowsArray.length === 0) {
      return;
    }

    const value = inputRef.current.value;
    console.log({ rows, selectedRowsArray });
    
    const currentDayTasks = timetable[currentDay];
    if (!currentDayTasks || currentDayTasks.length === 0) {
      console.error('No tasks found for current day');
      return;
    }

    const startIdx = selectedRowsArray[0];
    const endIdx = selectedRowsArray[selectedRowsArray.length - 1] + 1;
    const selectedTasks = currentDayTasks.slice(startIdx, endIdx);
    
    if (selectedTasks.length === 0) {
      console.error('No tasks selected');
      return;
    }

    console.log({ selectedTasks });
    const selectedIds = selectedTasks.map((task) => task.id);

    const newTimeTable = currentDayTasks.filter((task) => {
      return !selectedIds.includes(task.id);
    });

    console.log({ newTimeTable });

    const newTask: Task = {
      id: Date.now(),
      title: String(value),
      completed: false,
      timeStart: selectedTasks[0].timeStart,
      timeEnd: selectedTasks[selectedTasks.length - 1].timeEnd,
      day: currentDay,
    };

    newTimeTable.splice(startIdx, 0, newTask);
    console.log('after', newTimeTable);

    setInitialTasks(newTimeTable, currentDay);

    dismiss();
    onClose();
  };

  return (
    <>
      <IonModal
        className="ion-padding add-task-modal"
        ref={modal}
        trigger="open-modal"
        presentingElement={presentingElement}
        initialBreakpoint={0.75}
        breakpoints={[0, 0.25, 0.5, 0.75]}
        handleBehavior="cycle"
      >
        <IonHeader className="ion-padding-top">
          <IonToolbar>
            <IonTitle>Add Task - {getFullDayName(currentDay)}</IonTitle>
            <IonButtons slot="end">
              <IonButton color="secondary" onClick={() => saveTask()}>
                Submit
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem lines="none">
            <IonIcon icon={bookOutline} slot="start" />
            <IonInput ref={inputRef} type="text" placeholder="Task Name" />
          </IonItem>
        </IonContent>
      </IonModal>
    </>
  );
};
