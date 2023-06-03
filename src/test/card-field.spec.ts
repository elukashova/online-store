import App from '../components/app/app';
import Header from '../components/header/header';
import { Callback } from '../components/shopping-cart/shopping-cart.types';
import CardsField from '../components/cards-field/cards-field';

const app: App = new App(document.body);
const callback: Callback = app.route;
const header: Header = new Header(callback);
const cardsField: CardsField = new CardsField(header, callback);

describe('CardsField class', () => {
  test('defines composeQueryString() method', () => {
    expect(cardsField.composeQueryString).toBeDefined();
  });

  test('composeQueryString() method return right value for all filters', () => {
    expect(cardsField.composeQueryString('price, 73, 106')).toBe('73~106');
    expect(cardsField.composeQueryString('count, 3, 20')).toBe('3~20');
    expect(cardsField.composeQueryString('search,where is my mind')).toBe('where is my mind');
  });
});
