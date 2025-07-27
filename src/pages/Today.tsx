import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Today.css";
import { useTimeTableStoreV2 } from "../store";
import { dayToNumber, getFullDayName, numberToDay } from "../utils/time-utils";
import { checkmarkCircleOutline, closeCircle, closeCircleOutline, ellipseOutline, helpCircle } from "ionicons/icons";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface TodayTask {
  title: string;
  startTime: string;
  endTime: string;
  startDay: string;
  endDay: string;
  done: boolean;
}

const Streaks: React.FC = () => {
  let slotGroup = useTimeTableStoreV2((state) => state.slotGroup);
  let { streakCounter, setStreakCounter } = useTimeTableStoreV2();
  let [tasks, setTasks] = useState<TodayTask[] | []>([]);

  let today = new Date();
  let todayDate = today.getDay();
  console.log("Today is: ", todayDate);
  if (todayDate === 0) {
    todayDate = 7; // Adjust for Sunday
  }
  let todayValue = getFullDayName(numberToDay[todayDate]);

  const handleUpdateTask = (task: TodayTask) => {
    console.log("Updating task: ", task);
    // if task already done cant update
    if (task.done) return;

    let updatedTasks = tasks.map((t) => {
      if (t.title === task.title && t.startTime === task.startTime) {
        return { ...t, done: !t.done };
      }
      return t;
    });
    setTasks(updatedTasks);
    let tempStreakCounter = { ...streakCounter };
    if (!tempStreakCounter[task.title]) {
      tempStreakCounter[task.title] = { count: 1, logs: [new Date().toDateString()] };
    } else {
      tempStreakCounter[task.title].count = tempStreakCounter[task.title].count + 1;
      tempStreakCounter[task.title]?.logs.push(new Date().toDateString());
    }
    setStreakCounter(tempStreakCounter);
  };

  useEffect(() => {
    let tempTasks: any = [];
    let todayTasks = slotGroup
      .map((slot) => {
        // console.log("slot ", slot);
        let task: any = { startTime: slot.startTime, endTime: slot.endTime };
        slot.tasks.map((t) => {
          let startDayValue = dayToNumber[t.startDay];
          let endDayValue = dayToNumber[t.endDay];
          console.log({
            startDayValue,
            endDayValue,
            startDay: t.startDay,
            endDay: t.endDay,
            title: t.title,
            todayDate,
          });
          console.log(
            "if statement : ",
            startDayValue >= todayDate && endDayValue <= todayDate
          );
          if (todayDate >= startDayValue && todayDate <= endDayValue) {
            console.log("inside if", t.title);
            task.title = t.title;
            task.done = streakCounter[task.title]?.logs?.includes(new Date().toDateString());
            tempTasks.push(task);
          }
        });
      })
      .flat();

    console.log({ tempTasks });
    setTasks(tempTasks);
  }, [slotGroup]);

  // console.log("Today's tasks: ", todayTasks);

  return (
    <IonPage>
     <ErrorBoundary fallbackRender={({ error }) => <div>Error: {error.message}</div>}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            Today
            <IonText className="today-value">[{todayValue}]</IonText>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">
              Today{" "}
              <IonText style={{ fontSize: "14px", paddingLeft: "4px" }}>
                [{todayValue}]
              </IonText>{" "}
            </IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <IonCard 
                key={index}
                color="secondary" 
                className={ task.done ? "task-done-card" : "task-undone-card"}>
                <IonCardHeader>
                  <div style={{ padding: "8px", display: "flex" }}>
                    <div
                      style={{
                        display: "flex",
                        // alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div style={{ padding: "4px", width: "80px" }}>
                        <IonButton
                          fill="clear"
                          color="primary"
                          slot="end"
                          onClick={() => handleUpdateTask(task)}
                        >
                          <IonIcon
                            className={ task.done ? "task-done-icon" : "task-undone-icon"}
                            icon={task.done ? checkmarkCircleOutline : ellipseOutline}
                          />
                        </IonButton>
                      </div>
                      <div>
                        <IonCardSubtitle>
                          <IonBadge class="badge">
                          {task.startTime + " - " + task.endTime}
                          </IonBadge>
                        </IonCardSubtitle>
                        <IonCardTitle>{task.title}</IonCardTitle>
                      </div>
                    </div>
                  </div>
                </IonCardHeader>
              </IonCard>
            ))
          ) : (
            <IonContent className="ion-padding">No tasks for today</IonContent>
          )}
        </IonContent>
      </IonContent>
      </ErrorBoundary>
    </IonPage>
  );
};

export default Streaks;
