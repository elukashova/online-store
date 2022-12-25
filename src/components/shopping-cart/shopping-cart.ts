import './shopping-cart.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';
import CartCard from './card-cart';
import Header from '../header/header';
import { checkDataInLocalStorage, setDataToLocalStorage } from '../../utils/localStorage';
import { JsonObj } from '../../utils/localStorage.types';
import cardsData from '../../assets/json/data';
import { ObservedSubject } from '../card/card.types';
// import { ItemInfoType } from './shopping-cart.types';

export default class Cart extends BaseComponent {
  private storageInfo: JsonObj | null = checkDataInLocalStorage('addedItems');

  private itemsOrder: number = 0;

  private addedItems: number[] = []; // для сохранения id добавленных товаров в local storage

  private cartItems: number;

  private totalPrice: number;

  private totalPriceElement: HTMLElement | null = null;

  private cartItemsElement: HTMLElement | null = null;

  private cartContainer: HTMLElement | null = null;

  private summaryContainer: HTMLElement | null = null;

  constructor(public readonly header: Header) {
    super('div', 'cart-container cart');
    this.cartItems = this.header.headerInfo.cartItems;
    this.totalPrice = this.header.headerInfo.totalPrice;
    if (this.storageInfo !== null) {
      this.render();
    } else {
      this.showEmptyCart();
    }
  }

  // eslint-disable-next-line max-lines-per-function
  public render(): void {
    // items block
    this.cartContainer = rendered('div', this.element, 'cart__items_container cart-items');
    const cartInfoContainer: HTMLElement = rendered('div', this.cartContainer, 'cart-items__info');
    const totalNumWrapper: HTMLElement = rendered('div', cartInfoContainer, 'cart-items__info_items info-items');
    rendered('span', totalNumWrapper, 'info-items__text', 'Items:');
    rendered('span', totalNumWrapper, 'info-items__number', '2');
    const totalPagesWrapper: HTMLElement = rendered('div', cartInfoContainer, 'cart-items__info_pages info-pages');
    rendered('img', totalPagesWrapper, 'info-pages__btn-left', '', {
      src: '../../assets/icons/cart-icon__left.svg',
    });
    rendered('span', totalPagesWrapper, 'info-pages__pages-total', '1');
    rendered('img', totalPagesWrapper, 'info-pages__btn-right', '', {
      src: '../../assets/icons/cart-icon__right.svg',
    });
    // items
    // проверяем local storage и выбираем нужные данные из json для создания карточек товара
    cardsData.products.forEach((data) => {
      if (this.storageInfo !== null) {
        this.addedItems = Object.values(this.storageInfo);
        for (let i: number = 0; i < this.addedItems.length; i += 1) {
          if (data.id === this.addedItems[i]) {
            this.itemsOrder += 1;
            const card = new CartCard(data, this.itemsOrder);
            card.attachObserver(this.header);
            card.attachObserver(this);
            this.cartContainer?.append(card.element);
          }
        }
      }
    });
    // summary
    this.summaryContainer = rendered('div', this.element, 'cart-summary__container cart-summary');
    rendered('span', this.summaryContainer, 'cart-summary__title', 'Summary');
    const totalItemsContainer: HTMLElement = rendered(
      'div',
      this.summaryContainer,
      'cart-summary__total-items_container cart-total-items',
    );
    rendered('span', totalItemsContainer, 'cart-total-items__text', 'Items:');
    this.cartItemsElement = rendered('span', totalItemsContainer, 'cart-total-items__num', `${this.cartItems}`);
    const totalSumContainer: HTMLElement = rendered(
      'div',
      this.summaryContainer,
      'cart-summary__total-sum_container total-sum',
    );
    rendered('span', totalSumContainer, 'cart-total-sum__text', 'Total:');
    this.totalPriceElement = rendered('span', totalSumContainer, 'cart-total-sum__num', `$ ${this.totalPrice}`);
    const promocodeContainer: HTMLElement = rendered(
      'div',
      this.summaryContainer,
      'cart-summary__promocode cart-promocode',
    );
    rendered('input', promocodeContainer, 'cart-promocode__input', '', {
      type: 'search',
      placeholder: 'Enter promo code',
    });
    rendered('div', this.summaryContainer, 'cart-total-sum__line');
    rendered('button', this.summaryContainer, 'cart-total-sum__buy-btn', 'buy now');
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
  public update(subject: ObservedSubject): void {
    if (subject instanceof CartCard) {
      if (subject.plus === true && subject.cartItemInfo.itemAmount <= subject.stock) {
        this.totalPrice += subject.price;
        this.cartItems += 1;
        if (this.totalPriceElement && this.cartItemsElement) {
          this.totalPriceElement.textContent = `$ ${this.totalPrice}`;
          this.cartItemsElement.textContent = `${this.cartItems}`;
        }
      } else if (subject.minus === true && subject.cartItemInfo.itemAmount >= 0) {
        this.totalPrice -= subject.price;
        this.cartItems -= 1;
        if (this.totalPriceElement && this.cartItemsElement) {
          this.totalPriceElement.textContent = `$ ${this.totalPrice}`;
          this.cartItemsElement.textContent = `${this.cartItems}`;
        }
        this.checkIfZero(subject);
      }
    }
  }

  /* проверить, являетли ли количество одного продукта нулевым
  и последующее удаление */
  private checkIfZero(subject: ObservedSubject): void {
    if (subject instanceof CartCard && subject.cartItemInfo.itemAmount === 0) {
      localStorage.removeItem(`${subject.id}`); // удаляю из local storage
      const index = this.addedItems.indexOf(subject.id); // удаляю из массива добавленных в корзину
      this.addedItems.splice(index, 1);
      setDataToLocalStorage(this.addedItems); // обновляю инфу о добавленных в корзину
      subject.element.remove(); // удаляю со страницы
      // если у меня ноль товара на странице, надо вывести страницу пустой корзины
      if (this.addedItems.length === 0) {
        this.cartContainer?.remove();
        this.summaryContainer?.remove();
        this.showEmptyCart();
      }
    }
  }
}
