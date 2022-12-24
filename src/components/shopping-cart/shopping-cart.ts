/* eslint-disable max-lines-per-function */
import './shopping-cart.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';
import CartCard from './card-cart';
import Header from '../header/header';
import { checkDataInLocalStorage } from '../../utils/localStorage';
import { JsonObj } from '../../utils/localStorage.types';
import cardsData from '../../assets/json/data';

export default class Cart extends BaseComponent {
  private readonly storageInfo: JsonObj | null = checkDataInLocalStorage('addedItems');

  private itemsQuantity: number = 0;

  constructor(public readonly header: Header) {
    super('div', 'cart-container cart');
    this.render();
  }

  public render(): void {
    // items block
    const cartContainer: HTMLElement = rendered('div', this.element, 'cart__items_container cart-items');
    const cartInfoContainer: HTMLElement = rendered('div', cartContainer, 'cart-items__info');
    const totalNumWrapper: HTMLElement = rendered('div', cartInfoContainer, 'cart-items__info_items info-items');
    rendered('span', totalNumWrapper, 'info-items__text', 'Items:');
    rendered('span', totalNumWrapper, 'info-items__number', `${this.header.cartItems}`);
    const totalPagesWrapper: HTMLElement = rendered('div', cartInfoContainer, 'cart-items__info_pages info-pages');
    rendered('img', totalPagesWrapper, 'info-pages__btn-left', '', {
      src: '../../assets/icons/cart-icon__left.svg',
    });
    rendered('span', totalPagesWrapper, 'info-pages__pages-total', '1');
    rendered('img', totalPagesWrapper, 'info-pages__btn-right', '', {
      src: '../../assets/icons/cart-icon__right.svg',
    });

    // item
    // проверяем local storage и выбираем нужные данные из json для создания карточек товара
    cardsData.products.forEach((data) => {
      if (this.storageInfo !== null) {
        const values: number[] = Object.values(this.storageInfo);
        for (let i: number = 0; i < values.length; i += 1) {
          if (data.id === values[i]) {
            this.itemsQuantity += 1;
            const card = new CartCard(data, this.itemsQuantity, this.header);
            cartContainer.append(card.element);
          }
        }
      }
    });

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
    rendered('span', totalItemsContainer, 'cart-total-items__num', `${this.header.cartItems}`);
    const totalSumContainer: HTMLElement = rendered(
      'div',
      summaryContainer,
      'cart-summary__total-sum_container total-sum',
    );
    rendered('span', totalSumContainer, 'cart-total-sum__text', 'Total:');
    rendered('span', totalSumContainer, 'cart-total-sum__num', `${this.header.totalPrice}`);
    const promocodeContainer: HTMLElement = rendered('div', summaryContainer, 'cart-summary__promocode cart-promocode');
    rendered('input', promocodeContainer, 'cart-promocode__input', '', {
      type: 'search',
      placeholder: 'Enter promo code',
    });
    rendered('div', summaryContainer, 'cart-total-sum__line');
    rendered('button', summaryContainer, 'cart-total-sum__buy-btn', 'buy now');
  }
}
