import Header from '../header/header';
import Footer from '../footer/footer';
import { RoutesComponents } from './app-types';
import Routes from './routes.types';
import Main from '../main/main-component';
import CardsField from '../cards-field/cards-field';
import ShoppingCart from '../shopping-cart/shopping-cart';
import ProductPage from '../product-page/product-page';
import Page404 from '../404/404';
import AboutPage from '../about-page/about-page';
import cardsData from '../../assets/json/data';

export default class App {
  private readonly header: Header;

  private readonly mainContainer: Main = new Main();

  private readonly footer: Footer = new Footer();

  private readonly routes: RoutesComponents;

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

  public route = (checkout?: boolean): void => {
    if (checkout && checkout === true) {
      this.locationHandler(checkout);
    } else {
      this.locationHandler();
    }
  };

  // eslint-disable-next-line max-lines-per-function
  public locationHandler = async (checkout?: boolean): Promise<void> => {
    const { length } = window.location.pathname;
    const location: string = !length ? Routes.Home : window.location.pathname;
    const productIdFromLocation: string = location.replace(/^\D+/g, '');

    if (Number(productIdFromLocation) <= cardsData.products.length) {
      this.productID = productIdFromLocation;
    }

    switch (location) {
      case Routes.Home:
        this.routes.store = new CardsField(this.header, this.route);
        this.handleCurrentComponentRoute(this.routes.store.element, this.header.storeLink);
        break;
      case Routes.About:
        this.routes.about = new AboutPage(this.route);
        this.handleCurrentComponentRoute(this.routes.about.element, this.header.aboutLink);
        break;
      case Routes.Cart:
        this.routes.cart = new ShoppingCart(this.header, this.route, this.rootElement, checkout);
        this.handleCurrentComponentRoute(this.routes.cart.element, this.header.shoppingCartLink);
        break;
      case `${Routes.Product}/${this.productID}`:
        this.routes.productPage = new ProductPage(Number(this.productID), this.route);
        this.routes.productPage.attachObserver(this.header);
        this.handleCurrentComponentRoute(this.routes.productPage.element);
        break;
      default:
        this.routes.notfound = new Page404();
        this.handleCurrentComponentRoute(this.routes.notfound.element);
    }

    const child: ChildNode | null = this.mainContainer.element.firstChild;
    if (!child && this.component) {
      this.mainContainer.setContent(this.component);
    } else if (child && this.component) {
      this.mainContainer.element.replaceChild(this.component, child);
    }
  };

  private handleCurrentComponentRoute(element: HTMLElement, link?: HTMLElement | null): void {
    this.component = element;
    if (link) {
      this.header.activateLink(link);
    } else {
      this.header.deleteAllActiveClasses();
    }
  }
}
