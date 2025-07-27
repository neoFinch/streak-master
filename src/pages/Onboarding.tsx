import {
  IonContent,
  IonHeader,
  IonicSlides,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import 'swiper/css';
import '@ionic/react/css/ionic-swiper.css';
import {Swiper, SwiperSlide} from "swiper/react";

export const Onboarding: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Welcome to Streak Master</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText>
          <h2>Get Started with Your Habits</h2>
          <p>Track your habits and build streaks to stay motivated!</p>
        </IonText>
        {/* Add more onboarding content here */}
        <Swiper>
          <SwiperSlide>Slide 1</SwiperSlide>
          <SwiperSlide>Slide 2</SwiperSlide>
          <SwiperSlide>Slide 3</SwiperSlide>
        </Swiper>
      </IonContent>
    </IonPage>
  );
};
