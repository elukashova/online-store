import './styles.css';
import App from './components/app/app';

window.onload = (): void => {
  const app = new App(document.body);
  app.init();
};
