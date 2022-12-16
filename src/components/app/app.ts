import Header from '../header/header';
import Footer from '../footer/footer';
import MainComponent from '../base-component/main-component';
import MainStore from '../main.store/main.store';
import MainCart from '../main.cart/main.cart';
import MainAbout from '../main.about/main.about';

export const enum PageIds {
  StorePage = 'store',
  CartPage = 'cart',
  AboutPage = 'about',
}

export default class App {
  private static container: HTMLElement = document.body;

  private header: Header = new Header();

  private footer: Footer = new Footer();

  private mainStore: MainStore = new MainStore('store');

  private mainCart: MainCart = new MainCart('cart');

  private mainAbout: MainAbout = new MainAbout('about');

  public renderNewPage(id: string): void {
    // рендер страницы по полученному id
    let page: MainComponent | null = null;

    if (id === PageIds.StorePage) {
      // проверяем с каким enum совпадает переданный id
      page = new MainStore(id);
    } else if (id === PageIds.CartPage) {
      page = new MainCart(id);
    } else if (id === PageIds.AboutPage) {
      page = new MainAbout(id);
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

  private changeRoute(): void {
    // по клику получаем hash и рендерим по нему новый мейн
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1);
      this.renderNewPage(hash);
    });
  }

  constructor(private readonly rootElement: HTMLElement) {}

  public init(): void {
    this.rootElement.classList.add('root'); // добавляю класс к боди для стилей
    this.rootElement.append(this.header.element);
    this.header.render();
    this.renderNewPage('store'); // создаем базовый мейн
    this.changeRoute(); // при клике на элементы смены страницы получаем хэш и заново рендерим
    this.rootElement.append(this.footer.element);
    this.footer.render();
  }
}
