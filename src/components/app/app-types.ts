import Page404 from '../404/404';
import AboutPage from '../about-page/about-page';
import CardsField from '../cards-field/cards-field';
import ProductPage from '../product-page/product-page';
import Cart from '../shopping-cart/shopping-cart';

export interface Routes {
  store: CardsField;
  about?: AboutPage;
  productPage?: ProductPage;
  cart?: Cart;
  notfound?: Page404;
}
