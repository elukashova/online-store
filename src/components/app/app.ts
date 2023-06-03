import Header from '../header/header';
import Footer from '../footer/footer';
import { Routes } from './app-types';
import Main from '../main/main-component';
import CardsField from '../cards-field/cards-field';
import Cart from '../shopping-cart/shopping-cart';
import ProductPage from '../product-page/product-page';
import Page404 from '../404/404';
import AboutPage from '../about-page/about-page';
import cardsData from '../../assets/json/data';

export default class App {
  private readonly header: Header;

  private readonly mainContainer: Main = new Main();

  private readonly footer: Footer = new Footer();

  private readonly routes: Routes;

  private productID: string = '';

  private component: HTMLElement | null = null;

  constructor(private readonly rootElement: HTMLElement) {
    this.header = new Header(this.route);
    this.routes = {
      store: new CardsField(this.header, this.route),
    };
  }

  public init(): void {
    this.rootElement.classList.add('root');
    this.rootElement.append(this.header.element, this.mainContainer.element, this.footer.element);
    this.locationHandler();
  }

  public route = (event: Event, checkout?: boolean): void => {
    const e: Event = event || window.event;
    e.preventDefault();

    if (e.target instanceof HTMLAnchorElement) {
      window.history.pushState({}, '', e.target.href);
    }

    if (checkout && checkout === true) {
      this.locationHandler(checkout);
    } else {
      this.locationHandler();
    }
  };

  // eslint-disable-next-line max-lines-per-function
  public locationHandler = async (checkout?: boolean): Promise<void> => {
    const location: string = window.location.pathname.length === 0 ? '/' : window.location.pathname;

    if (Number(location.slice(9)) <= cardsData.products.length) {
      this.productID = location.slice(9);
    }

    switch (location) {
      case '/':
        this.routes.store = new CardsField(this.header, this.route);
        this.component = this.routes.store.element;
        this.header.activateLink(this.header.storeLink);
        break;
      case '/about':
        this.routes.about = new AboutPage(this.route);
        this.component = this.routes.about.element;
        this.header.activateLink(this.header.aboutLink);
        break;
      case '/cart':
        this.routes.cart = new Cart(this.header, this.route, this.rootElement, checkout);
        this.component = this.routes.cart.element;
        this.header.activateLink(this.header.shoppingCartLink);
        break;
      case `/product/${this.productID}`:
        this.routes.productPage = new ProductPage(Number(this.productID), this.route);
        this.routes.productPage.attachObserver(this.header);
        this.component = this.routes.productPage.element;
        this.header.deleteActiveClass();
        break;
      default:
        this.routes.notfound = new Page404();
        this.component = this.routes.notfound.element;
        this.header.deleteActiveClass();
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
}
