import CartCard from '../components/shopping-cart/card-cart';
import cardsData from '../assets/json/data';
import App from '../components/app/app';
import Header from '../components/header/header';
import { Callback } from '../components/shopping-cart/shopping-cart.types';

const app: App = new App(document.body);
const callback: Callback = app.route;
const header: Header = new Header(callback);
const cartCard: CartCard = new CartCard(cardsData.products[0], 1, callback);

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Header observer of cart card', () => {
  test('calls observer on button click with minusBtnCallback() method', () => {
    const spy = jest.spyOn(header, 'decreaseNumbers');
    cartCard.itemAmount = 5;
    cartCard.price = 25;
    cartCard.minus = true;
    const updateInfo: void = header.update(cartCard);

    expect(spy).toBeCalledTimes(1);
    expect(updateInfo).toBe(undefined);
  });
});
