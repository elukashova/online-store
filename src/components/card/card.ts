import './card.styles.css';
import rendered from '../../utils/render/render';
import { CardData, Observer } from './card.types';
import BaseComponent from '../base-component/base-component';

export default class Card extends BaseComponent {
  public id: number;

  public title: string;

  public category: string;

  public rating: number;

  public stock: number;

  public price: number;

  public discountPercentage: number;

  public images: string[];

  public buyButton: HTMLElement | null = null;

  public itemPrice: number = 0;

  public itemQuantity: number = 0;

  public totalPrice: number = 0;

  public totalItems: number = 0;

  private observers: Observer[] = [];

  constructor(data: CardData) {
    super('div', 'cards__item card');
    this.id = data.id;
    this.title = data.title;
    this.category = data.category;
    this.rating = data.rating;
    this.stock = data.stock;
    this.price = data.price;
    this.discountPercentage = data.discountPercentage;
    this.images = data.images.slice();
    this.render();
  }

  // eslint-disable-next-line max-lines-per-function
  public render(): void {
    this.element.classList.add(`${this.category}`);
    rendered('img', this.element, 'card__img', '', {
      src: this.images[0],
    });
    const cardInfo: HTMLElement = rendered('div', this.element, 'card__info');
    const cardInfoWrapper: HTMLElement = rendered('div', cardInfo, 'card__info_wrapper');
    rendered('p', cardInfoWrapper, 'card__name', `${this.title}`);
    rendered('p', cardInfoWrapper, 'card__category', `${this.category}`);
    rendered('p', cardInfoWrapper, 'card__rating', `Rating: ${this.rating}`);
    rendered('p', cardInfoWrapper, 'card__stock', `Stock: ${this.stock}`);
    rendered('p', cardInfoWrapper, 'card__price', `$ ${this.price}`);
    rendered('p', cardInfoWrapper, 'card__discount', `Discount: ${this.discountPercentage}%`);
    const buttonsWrapper: HTMLElement = rendered('div', cardInfo, 'card__btns');
    rendered('img', buttonsWrapper, 'card__btn_open-card', '', {
      src: '../../assets/icons/button-open-card.svg',
    });
    this.buyButton = rendered('img', buttonsWrapper, 'card__btn_buy', '', {
      src: '../../assets/icons/button-buy.svg',
    });
    this.buyButton.addEventListener('click', this.buyBtnCallback);
  }

  private buyBtnCallback = (): void => {
    if (!this.element.classList.contains('added')) {
      this.element.classList.add('added');
      this.buyButton?.setAttribute('src', '../../assets/icons/button-close.svg');
      this.notifyObserver();
    } else {
      this.element.classList.remove('added');
      this.buyButton?.setAttribute('src', '../../assets/icons/button-buy.svg');
      this.notifyObserver();
    }
  };

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
