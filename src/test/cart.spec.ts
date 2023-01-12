import Cart from '../components/shopping-cart/shopping-cart';
import App from '../components/app/app';
import Header from '../components/header/header';
import { Callback } from '../components/shopping-cart/shopping-cart.types';

const app: App = new App(document.body);
const callback: Callback = app.route;
const header: Header = new Header(callback);
const cart: Cart = new Cart(header, callback);

describe('Cart class', () => {
  const validInput: string = 'SMILE';

  test('defines choosePromoValue() method', () => {
    expect(cart.choosePromoValue(validInput)).toBe(15);
  });
});

describe('Cart class', () => {
  cart.appliedPromos = ['SMILE', 'BEHAPPY'];
  cart.totalPrice = 100;

  test('defines calculateNewPrice() method', () => {
    expect(cart.calculateNewPrice()).toBe(75);
  });
});
