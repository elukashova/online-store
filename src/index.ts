import './reset.styles.css';
import './styles.css';
import App from './components/app/app';

const app: App = new App(document.body);

window.onload = (): void => {
  app.init();
};

window.onpopstate = (): void => {
  app.locationHandler();
};
