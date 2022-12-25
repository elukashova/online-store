/* eslint-disable max-lines-per-function */
import './shopping-cart.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';
import CartCard from './card-cart';
import Header from '../header/header';
import { checkDataInLocalStorage } from '../../utils/localStorage';
import { JsonObj } from '../../utils/localStorage.types';
import cardsData from '../../assets/json/data';
// import { ObservedSubject } from '../card/card.types';

export default class Cart extends BaseComponent {
  private readonly storageInfo: JsonObj | null = checkDataInLocalStorage('addedItems');

  private itemsOrder: number = 0;

  constructor(public readonly header: Header) {
    super('div', 'cart-container cart');
    if (this.storageInfo !== null) {
      this.render();
    } else {
      this.showEmptyCart();
    }
  }

  public render(): void {
    // items block
    const cartContainer: HTMLElement = rendered('div', this.element, 'cart__items_container cart-items');
    const cartInfoContainer: HTMLElement = rendered('div', cartContainer, 'cart-items__info');
    const totalNumWrapper: HTMLElement = rendered('div', cartInfoContainer, 'cart-items__info_items info-items');
    rendered('span', totalNumWrapper, 'info-items__text', 'Items:');
    rendered('span', totalNumWrapper, 'info-items__number', `${this.header.headerInfo.cartItems}`);
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
            this.itemsOrder += 1;
            const card = new CartCard(data, this.itemsOrder, this.header);
            card.attachObserver(this.header);
            card.attachObserver(this);
            cartContainer.append(card.element);
          }
        }
      }
    });

    // summary
    const summaryContainer: HTMLElement = rendered('div', this.element, 'cart-summary__container cart-summary');
    rendered('span', summaryContainer, 'cart-summary__title', 'Summary');
    const totalItemsContainer: HTMLElement = rendered(
      'div',
      summaryContainer,
      'cart-summary__total-items_container cart-total-items',
    );
    rendered('span', totalItemsContainer, 'cart-total-items__text', 'Items:');
    rendered('span', totalItemsContainer, 'cart-total-items__num', `${this.header.headerInfo.cartItems}`);
    const totalSumContainer: HTMLElement = rendered(
      'div',
      summaryContainer,
      'cart-summary__total-sum_container total-sum',
    );
    rendered('span', totalSumContainer, 'cart-total-sum__text', 'Total:');
    rendered('span', totalSumContainer, 'cart-total-sum__num', `${this.header.headerInfo.totalPrice}`);
    const promocodeContainer: HTMLElement = rendered('div', summaryContainer, 'cart-summary__promocode cart-promocode');
    rendered('input', promocodeContainer, 'cart-promocode__input', '', {
      type: 'search',
      placeholder: 'Enter promo code',
    });
    rendered('div', summaryContainer, 'cart-total-sum__line');
    rendered('button', summaryContainer, 'cart-total-sum__buy-btn', 'buy now');
  }

  // страница с пустой корзиной
  private showEmptyCart(): void {
    // меняю стили контейнера с грида на флекс
    this.element.style.display = 'flex';
    this.element.style.flexDirection = 'column';

    rendered('img', this.element, 'cart__empty_img', '', {
      src: '../../assets/images/empty-cart.png',
    });
    rendered('span', this.element, 'cart__empty_title', 'Your cart is empty!');
    rendered('span', this.element, 'cart__empty_text', 'Looks like you have not added anything to your cart yet.');
  }

  // функция обсервера
  public update(/* subject: ObservedSubject */): void {
    // if (subject instanceof Card && subject.element.classList.contains('added')) {
    //   this.addedItems.push(subject.id);
    //   console.log(this.addedItems);
    //   setDataToLocalStorage(this.addedItems);
    // }
    // if (subject instanceof Card && !subject.element.classList.contains('added')) {
    //   const index = this.addedItems.indexOf(subject.id);
    //   this.addedItems.splice(index, 1);
    //   setDataToLocalStorage(this.addedItems);
    // }
  }
}
