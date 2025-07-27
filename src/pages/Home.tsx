import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  RefresherEventDetail,
} from "@ionic/react";

import "./Home.css";
import TimeTableV2 from "../components/TimeTableV2";
import { Bounce, ToastContainer } from "react-toastify";

const Home: React.FC = () => {
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
          <IonTitle>Take Charge of Your Time</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Take Charge</IonTitle>
          </IonToolbar>
        </IonHeader>

        {/* <TimeTable/> */}
        <TimeTableV2 />
      </IonContent>
      <ToastContainer
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
    </IonPage>
  );
};

export default Home;
