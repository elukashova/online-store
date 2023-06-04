import Page404 from '../404/404';
import AboutPage from '../about-page/about-page';
import CardsField from '../cards-field/cards-field';
import ProductPage from '../product-page/product-page';
import ShoppingCart from '../shopping-cart/shopping-cart';

export interface RoutesComponents {
  store: CardsField;
  about?: AboutPage;
  productPage?: ProductPage;
  cart?: ShoppingCart;
  notfound?: Page404;
}
