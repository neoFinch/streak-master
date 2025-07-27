import { IonCard, IonContent, IonHeader, IonPage, IonText, IonTitle, IonToolbar } from '@ionic/react';
import './Stats.css';
import TaskStreakHistogram from '../components/TaskStreakHistogram';
import { useTimeTableStoreV2 } from '../store';

const Stats: React.FC = () => {

  let { streakCounter } = useTimeTableStoreV2();
  let taskData = Object.keys(streakCounter).map((key) => {
    return { task: key, streak: streakCounter[key].count };
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Stats</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Stats</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonCard>
        </IonCard>
        <TaskStreakHistogram taskData={taskData} />
      </IonContent>
    </IonPage>
  );
};

export default Stats;
