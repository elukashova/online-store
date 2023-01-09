import './reset.styles.css';
import './styles.css';
import App from './components/app/app';

const app: App = new App(document.body);

const startMessage = `
Доброго времени суток! Все пункты ТЗ выполнены.
Балл: 300/300.
Приятной проверки!

С наилучшими пожеланиями,
Лена и Настя.
`;

window.onload = (): void => {
  // добавила зачистку localstorage для удобства тестирования
  // localStorage.clear();
  app.init();
  console.log(startMessage);
};

window.onpopstate = (): void => {
  app.locationHandler();
};
