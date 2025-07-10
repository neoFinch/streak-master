import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
  RefresherEventDetail,
  IonDatetimeButton,
  IonFab,
  IonFabButton,
  IonIcon,
  IonFabList,
  IonLabel,
} from "@ionic/react";
import ExploreContainer from "../components/ExploreContainer";
import "./Home.css";
import { useTimeTableStore } from "../store";
import { TimeTable } from "../components/TimeTable";
import TimeTableV2 from "../components/TimeTableV2";
import { add, colorPalette, globe, document, analyticsSharp } from "ionicons/icons";

const Home: React.FC = () => {
  const { timetable } = useTimeTableStore();
  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    // refresh page
    window.location.reload();
    setTimeout(() => {
      // Any calls to load data go here
      event.detail.complete();
    }, 2000);
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Take Charge</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Take Charge</IonTitle>
          </IonToolbar>
        </IonHeader>

        {/* <TimeTable/> */}
        <TimeTableV2/>

        
      </IonContent>
    </IonPage>
  );
};

export default Home;
