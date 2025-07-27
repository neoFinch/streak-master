import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
  apps,
  appsOutline,
  barChart,
  ellipse,
  rocket,
  square,
  time,
  triangle,
} from "ionicons/icons";
import Home from "./pages/Home";
import Today from "./pages/Today";
import Stats from "./pages/Stats";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";
import { Onboarding } from "./pages/Onboarding";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/onboarding" exact={true} >
            <Onboarding />
          </Route>
          <Route exact path="/home">
            <Home />
          </Route>
          <Route exact path="/today">
            <Today />
          </Route>
          <Route path="/stats">
            <Stats />
          </Route>
          <Route exact path="/">
            <Redirect to="/onboarding" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home">
            <IonIcon aria-hidden="true" icon={apps} />
            <IonLabel>Habits</IonLabel>
          </IonTabButton>
          <IonTabButton tab="today" href="/today">
            <IonIcon aria-hidden="true" icon={time} />
            <IonLabel>Today</IonLabel>
          </IonTabButton>
          <IonTabButton tab="stats" href="/stats">
            <IonIcon aria-hidden="true" icon={barChart} />
            <IonLabel>Stats</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
