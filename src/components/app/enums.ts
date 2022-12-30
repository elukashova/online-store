import CardsField from '../cards-field/cards-field';
import ProductPage from '../product-page/product-page';
import Cart from '../shopping-cart/shopping-cart';

export interface Routes {
  store: CardsField;
  productPage?: ProductPage;
  cart?: Cart;
}
