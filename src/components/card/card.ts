import './card.styles.css';
import rendered from '../../utils/render/render';
import { DataType, Observer, Subject } from './card.types';
// import Header from '../header/header';

export default class Card implements Subject {
  public buyButton: HTMLElement | null = null;

  public totalPrice: number = 0;

  public cartItems: number = 0;

  private observers: Observer[] = [];

  // private header = new Header();

  constructor(private readonly container: HTMLElement) {}

  public attachObserver(observer: Observer): void {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      console.log('Subject: Observer has been attached already.');
    }
    console.log('Subject: Attached an observer.');
    this.observers.push(observer);
  }

  public removeObserver(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      console.log('Subject: Nonexistent observer.');
    }

    this.observers.splice(observerIndex, 1);
    console.log('Subject: Detached an observer.');
  }

  public notifyObserver(): void {
    console.log('Subject: Notifying observers...');
    for (let i: number = 0; i < this.observers.length; i += 1) {
      this.observers[i].update(this);
    }
  }

  public render(data: DataType): HTMLElement {
    const container: HTMLElement = rendered('div', this.container, 'cards__item card');
    container.classList.add(`${data.category}`);
    rendered('img', container, 'card__img', '', {
      src: data.images[0],
    });
    const cardInfo: HTMLElement = rendered('div', container, 'card__info');
    const cardInfoWrapper: HTMLElement = rendered('div', cardInfo, 'card__info_wrapper');
    rendered('p', cardInfoWrapper, 'card__name', `${data.title}`);
    rendered('p', cardInfoWrapper, 'card__category', `${data.category}`);
    rendered('p', cardInfoWrapper, 'card__rating', `Rating: ${data.rating}`);
    rendered('p', cardInfoWrapper, 'card__stock', `Stock: ${data.stock}`);
    rendered('p', cardInfoWrapper, 'card__price', `$ ${data.price}`);
    rendered('p', cardInfoWrapper, 'card__discount', `Discount: ${data.discountPercentage}%`);
    const buttonsWrapper: HTMLElement = rendered('div', cardInfo, 'card__btns');
    rendered('img', buttonsWrapper, 'card__btn_open-card', '', {
      src: '../../assets/icons/button-open-card.svg',
    });
    this.buyButton = rendered('img', buttonsWrapper, 'card__btn_buy', '', {
      src: '../../assets/icons/button-buy.svg',
    });
    this.buyButton.addEventListener('click', () => {
      this.cartItems += 1;
      this.totalPrice += data.price;
      this.notifyObserver();
    });
    return container;
  }

  public createCartItem(data: DataType): HTMLElement {
    const itemsContainer: HTMLElement = rendered('div', this.container, 'cart__items_container cart-items');
    const cartInfoContainer: HTMLElement = rendered('div', itemsContainer, 'cart-items__info');
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
    const firstItem: HTMLElement = rendered('div', itemsContainer, 'cart-items__item cart-item');
    rendered('span', firstItem, 'cart-item__order', '1');
    rendered('img', firstItem, 'cart-item__img', '', {
      src: data.images[0],
    });
    const firstItemDescr: HTMLElement = rendered('div', firstItem, 'cart-item__description');
    rendered('span', firstItemDescr, 'cart-item__description_title', data.title);
    rendered('span', firstItemDescr, 'cart-item__description_category', data.category);
    rendered('span', firstItemDescr, 'cart-item__description_size', `Size ${data.size}`);
    rendered('span', firstItemDescr, 'cart-item__description_rating', `Rating: ${data.rating.toString()}`);
    rendered('p', firstItemDescr, 'cart-item__description_text', data.description);

    return itemsContainer;
  }
}
