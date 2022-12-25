import './reset.styles.css';
import './styles.css';
import App from './components/app/app';

window.onload = (): void => {
  // добавила зачистку localstorage для удобства тестирования
  // localStorage.clear();
  const app = new App(document.body);
  app.init();
};
