import Header from '../header/header';
import Footer from '../footer/footer';
import { Routes } from './app-types';
import Main from '../main/main-component';
import CardsField from '../cards-field/cards-field';
import Cart from '../shopping-cart/shopping-cart';
import ProductPage from '../product-page/product-page';
import Page404 from '../404/404';

export default class App {
  private readonly header: Header;

  private readonly mainContainer: Main = new Main();

  private readonly footer: Footer = new Footer();

  private readonly routes: Routes;

  private productID: string = '';

  private component: Element | null = null;

  constructor(private readonly rootElement: HTMLElement) {
    this.header = new Header(this.route);
    this.routes = {
      store: new CardsField(this.header, this.route),
    };
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
    } else {
      const { href } = window.location;
      window.history.pushState({}, '', href);
    }

    this.locationHandler();
  };

  // eslint-disable-next-line max-lines-per-function
  public locationHandler = async (): Promise<void> => {
    const location: string = window.location.pathname.length === 0 ? '/' : window.location.pathname;

    if (Number(location.slice(1))) {
      this.productID = location.slice(1);
    }
    // footer и header удаляюься на 404, поэтому надо проверить, не надо ли их снова повесить
    this.appendHeaderFooter(this.header.element, this.footer.element);

    switch (location) {
      case '/cart':
        this.routes.cart = new Cart(this.header, this.route, this.rootElement);
        this.component = this.routes.cart.element;
        break;
      case '/':
        this.routes.store = new CardsField(this.header, this.route);
        this.component = this.routes.store.element;
        break;
      case `/${this.productID}`:
        this.routes.productPage = new ProductPage(Number(this.productID), this.route);
        this.routes.productPage.attachObserver(this.header);
        this.component = this.routes.productPage.element;
        break;
      default:
        this.routes.notfound = new Page404(this.route);
        this.component = this.routes.notfound.element;
        this.rootElement.removeChild(this.header.element);
        this.rootElement.removeChild(this.footer.element);
    }

    if (!this.mainContainer.element.hasChildNodes()) {
      this.mainContainer.setContent(this.component);
    } else {
      const child: ChildNode | null = this.mainContainer.element.firstChild;
      if (child) {
        this.mainContainer.element.replaceChild(this.component, child);
      }
    }
  };

  private appendHeaderFooter(header: Element, footer: Element): void {
    if (this.rootElement.firstChild !== header && this.rootElement.lastChild !== footer) {
      this.rootElement.insertBefore(header, this.mainContainer.element);
      this.rootElement.append(footer);
    }
  }
}
