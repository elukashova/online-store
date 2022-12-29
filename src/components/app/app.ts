import Header from '../header/header';
import Footer from '../footer/footer';
import { Routes } from './enums';
import Main from '../main/main-component';
import CardsField from '../cards-field/cards-field';
import Cart from '../shopping-cart/shopping-cart';

export default class App {
  private readonly header: Header;

  private readonly mainContainer: Main = new Main();

  private readonly footer: Footer = new Footer();

  private readonly routes: Routes;

  constructor(private readonly rootElement: HTMLElement) {
    this.header = new Header(this.route);
    this.routes = {
      store: new CardsField(this.header),
      cart: new Cart(this.header),
    };
    this.init();
  }

  public init(): void {
    this.rootElement.classList.add('root');
    this.rootElement.append(this.header.element);
    this.rootElement.append(this.mainContainer.element);
    this.rootElement.append(this.footer.element);
    this.locationHandler();
  }

  public route = (event: Event): void => {
    const e: Event = event || window.event;
    e.preventDefault();
    if (e.target instanceof HTMLAnchorElement) {
      window.history.pushState({}, '', e.target.href);
      this.locationHandler();
    }
  };

  public locationHandler = async (): Promise<void> => {
    let location: string = window.location.pathname;
    if (location.length === 0) {
      location = '/';
    }

    let component: Element | null;

    switch (location) {
      case '/cart':
        this.routes.cart = new Cart(this.header);
        component = this.routes.cart.element;
        break;
      case '/':
        this.routes.store = new CardsField(this.header);
        component = this.routes.store.element;
        break;
      default:
        // строки для теста, будут заменены 404
        component = document.createElement('div');
        component.textContent = 'NO PAGE FOUND';
    }

    if (!this.mainContainer.element.hasChildNodes()) {
      this.mainContainer.setContent(component);
    } else {
      const child: ChildNode | null = this.mainContainer.element.firstChild;
      if (child) {
        this.mainContainer.element.replaceChild(component, child);
      }
    }
  };
}
