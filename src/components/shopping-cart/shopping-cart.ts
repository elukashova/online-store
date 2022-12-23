/* eslint-disable max-lines-per-function */
import './shopping-cart.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';
import { CardData } from '../card/card.types';
import CartCard from '../card/card-cart';
// import cardsData from '../../assets/json/data';
// import Filter from '../filter/filter';

export default class Cart extends BaseComponent {
  constructor() {
    super('div', 'cart-container cart');
  }

  public render(data: CardData): void {
    // item
    const card = new CartCard(data);
    this.element.append(card.element);

    // number
    const amountContainer: HTMLElement = rendered('div', this.element, 'cart__amount_container cart-amount');
    const changeAmountContainer: HTMLElement = rendered('div', amountContainer, 'cart-amount__change-container');
    rendered('img', changeAmountContainer, 'cart-amount__btn-minus', '', {
      src: '../../assets/icons/cart-icon__minus.svg',
    });
    rendered('span', changeAmountContainer, 'cart-amount__amount', '1');
    rendered('img', changeAmountContainer, 'cart-amount__btn-plus', '', {
      src: '../../assets/icons/cart-icon__plus.svg',
    });
    const stockAmountContainer: HTMLElement = rendered('div', amountContainer, 'cart-amount__stock-container');
    rendered('span', stockAmountContainer, 'cart-amount__stock-text', 'Stock:');
    rendered('span', stockAmountContainer, 'cart-amount__stock-num', '140');

    const itemPriceContainer: HTMLElement = rendered('div', amountContainer, 'cart-amount__price-container');
    rendered('span', itemPriceContainer, 'cart-amount__price-text', '$');
    rendered('span', itemPriceContainer, 'cart-amount__price-num', '150');

    // summary
    const summaryContainer: HTMLElement = rendered('div', this.element, 'cart-summary__container cart-summary');
    rendered('span', summaryContainer, 'cart-summary__title', 'Summary');
    const totalItemsContainer: HTMLElement = rendered(
      'div',
      summaryContainer,
      'cart-summary__total-items_container cart-total-items',
    );
    rendered('span', totalItemsContainer, 'cart-total-items__text', 'Items:');
    rendered('span', totalItemsContainer, 'cart-total-items__num', '2');
    const totalSumContainer: HTMLElement = rendered(
      'div',
      summaryContainer,
      'cart-summary__total-sum_container total-sum',
    );
    rendered('span', totalSumContainer, 'cart-total-sum__text', 'Total:');
    rendered('span', totalSumContainer, 'cart-total-sum__num', '$ 150');
    const promocodeContainer: HTMLElement = rendered('div', summaryContainer, 'cart-summary__promocode cart-promocode');
    rendered('input', promocodeContainer, 'cart-promocode__input', '', {
      type: 'search',
      placeholder: 'Enter promo code',
    });
    rendered('div', summaryContainer, 'cart-total-sum__line');
    rendered('button', summaryContainer, 'cart-total-sum__buy-btn', 'buy now');
  }
}
