import rendered from '../../utils/render/render';
import { CardDataType, Observer } from '../card/card.types';
import BaseComponent from '../base-component/base-component';
import Header from '../header/header';

export default class CartCard extends BaseComponent {
  public title: string;

  public category: string;

  public size: string;

  public rating: number;

  public images: string[];

  public description: string;

  public stock: number;

  public price: number;

  public discount: number;

  private observers: Observer[] = [];

  constructor(private data: CardDataType, private itemsOrder: number, private header: Header) {
    super('div', 'cart-items__item cart-item');
    this.title = data.title;
    this.category = data.category;
    this.rating = data.rating;
    this.size = data.size;
    this.images = data.images.slice();
    this.description = data.description;
    this.stock = data.stock;
    this.price = data.price;
    this.discount = data.discountPercentage;
    this.render();
  }

  public render(): void {
    // правая карточка
    const itemCard = rendered('div', this.element, 'cart-item__card');
    rendered('span', itemCard, 'cart-item__order', `${this.itemsOrder}`);
    rendered('img', itemCard, 'cart-item__img', '', {
      src: this.images[0],
    });
    const firstItemDescr: HTMLElement = rendered('div', itemCard, 'cart-item__description');
    rendered('span', firstItemDescr, 'cart-item__description_title', this.title);
    rendered('span', firstItemDescr, 'cart-item__description_category', this.category);
    rendered('span', firstItemDescr, 'cart-item__description_size', `Size ${this.size}`);
    rendered('span', firstItemDescr, 'cart-item__description_rating', `Rating: ${this.rating}`);
    rendered('span', firstItemDescr, 'cart-item__description_discount', `Discount: ${this.discount}`);
    rendered('p', firstItemDescr, 'cart-item__description_text', this.description);

    // левая часть с возможностью поменять количество
    const amountContainer = rendered('div', this.element, 'cart-item__amount_container');
    const itemAmountContainer: HTMLElement = rendered('div', amountContainer, 'cart-amount__change-container');
    const changeAmountContainer: HTMLElement = rendered('div', itemAmountContainer, 'cart-amount__change-container');
    rendered('img', changeAmountContainer, 'cart-amount__btn-minus', '', {
      src: '../../assets/icons/cart-icon__minus.svg',
    });
    rendered('span', changeAmountContainer, 'cart-amount__amount', '1');
    rendered('img', changeAmountContainer, 'cart-amount__btn-plus', '', {
      src: '../../assets/icons/cart-icon__plus.svg',
    });
    const stockAmountContainer: HTMLElement = rendered('div', amountContainer, 'cart-amount__stock-container');
    rendered('span', stockAmountContainer, 'cart-amount__stock-text', 'Stock:');
    rendered('span', stockAmountContainer, 'cart-amount__stock-num', `${this.stock}`);

    const itemPriceContainer: HTMLElement = rendered('div', amountContainer, 'cart-amount__price-container');
    rendered('span', itemPriceContainer, 'cart-amount__price-text', '$');
    rendered('span', itemPriceContainer, 'cart-amount__price-num', `${this.price}`);
  }

  // три метода, нужные для обсервера
  public attachObserver(observer: Observer): void {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      console.log('Subject: Observer has been attached already.');
    }
    // console.log('Subject: Attached an observer.');
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
    // console.log('Subject: Notifying observers...');
    for (let i: number = 0; i < this.observers.length; i += 1) {
      this.observers[i].update(this);
    }
  }
}
