import Header from '../header/header';
import Footer from '../footer/footer';
import MainStore from '../main/main.store/main.store';
import MainCart from '../main/main.cart/main.cart';
import MainAbout from '../main/main.about/main.about';
import Pages from './enums';
import Page from '../main/page-component';
import CardsField from '../cards-field/cards-field';

export default class App {
  private static container: HTMLElement = document.body;

  private readonly header: Header = new Header();

  private readonly footer: Footer = new Footer();

  private readonly cardsField: CardsField = new CardsField();

  private mainStore: MainStore = new MainStore(Pages.StorePage);

  private mainCart: MainCart = new MainCart(Pages.CartPage);

  private mainAbout: MainAbout = new MainAbout(Pages.AboutPage);

  constructor(private readonly rootElement: HTMLElement) {}

  public init(): void {
    this.rootElement.classList.add('root'); // добавляю класс к боди для стилей
    this.rootElement.append(this.header.element);
    this.header.render();
    this.renderNewPage(Pages.StorePage); // создаем базовый мейн
    this.getHashEvent(); // при клике на элементы смены страницы получаем хэш и заново рендерим
    // !!! временно вывела cardsField сюда, надо будет перенести потом
    this.rootElement.append(this.cardsField.element, this.footer.element);
    this.footer.render();
    this.cardsField.render();
  }

  public renderNewPage(id: string): void {
    // рендер страницы по полученному id
    // проверяем с каким enum совпадает переданный id
    let page: Page | null = null;
    switch (id) {
      case Pages.StorePage:
        page = new MainStore(id);
        page.setContent();
        break;
      case Pages.CartPage:
        page = new MainCart(id);
        page.setContent();
        break;
      case Pages.AboutPage:
        page = new MainAbout(id);
        page.setContent();
        break;
      default:
        console.log('Страницы с таким ID нет');
    }

    const currentMain: HTMLElement | null = document.querySelector('main');
    if (page) {
      const pageMain = page.render();
      if (currentMain) {
        currentMain.replaceWith(pageMain); // если мейн уже есть - заменяем его
      } else {
        App.container.append(pageMain); // если мейна нет (первая загрузка страницы) - вставляем его
      }
    }
  }

  private getHashEvent(): void {
    // по клику получаем hash и рендерим по нему новый мейн
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1);
      if (hash === '') {
        this.renderNewPage(Pages.StorePage);
      }
      this.renderNewPage(hash);
    });
  }
}
