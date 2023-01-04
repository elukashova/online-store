import './card.styles.css';
import rendered from '../../utils/render/render';
import { CardDataType, Observer } from './card.types';
import BaseComponent from '../base-component/base-component';
import { checkProductDataInLocalStorage } from '../../utils/localStorage';
import { PosterStorageType } from '../../utils/localStorage.types';

export default class Card extends BaseComponent {
  public id: number;

  public title: string;

  public category: string;

  public size: string;

  public stock: number;

  public price: number;

  public rating: number;

  public discountPercentage: number;

  public images: string[];

  public buyButton: HTMLElement | null = null;

  public itemPrice: number = 0;

  public itemQuantity: number = 0;

  public totalPrice: number = 0;

  private observers: Observer[] = [];

  private wasAdded: boolean = false;

  private readonly storageInfo: PosterStorageType[] | null = checkProductDataInLocalStorage('addedPosters');

  constructor(data: CardDataType, private callback: (event: Event) => void) {
    super('div', 'cards__item card');
    this.id = data.id;
    this.title = data.title;
    this.category = data.category;
    this.size = data.size;
    this.stock = data.stock;
    this.price = data.price;
    this.rating = data.rating;
    this.discountPercentage = data.discountPercentage;
    this.images = data.images.slice();
    this.render();
  }

  // eslint-disable-next-line max-lines-per-function
  public render(): void {
    this.element.classList.add(`${this.category}`);
    const cardImg: HTMLElement = rendered('img', this.element, 'card__img', '', {
      src: this.images[0],
      id: `img${this.id}`,
    });
    cardImg.addEventListener('click', this.productPageBtnCallback);
    const cardInfo: HTMLElement = rendered('div', this.element, 'card__info');
    const cardInfoWrapper: HTMLElement = rendered('div', cardInfo, 'card__info_wrapper');
    rendered('p', cardInfoWrapper, 'card__name', `${this.title}`);
    rendered('p', cardInfoWrapper, 'card__category', `${this.category}`);
    rendered('p', cardInfoWrapper, 'card__rating', `Size: ${this.size}`);
    rendered('p', cardInfoWrapper, 'card__stock', `Stock: ${this.stock}`);
    rendered('p', cardInfoWrapper, 'card__price', `$ ${this.price}`);
    rendered('p', cardInfoWrapper, 'card__rating', `Rating: ${this.rating}`); // для тестов сортировки
    rendered('p', cardInfoWrapper, 'card__discount', `Discount: ${this.discountPercentage}%`);
    const buttonsWrapper: HTMLElement = rendered('div', cardInfo, 'card__btns');
    const productPageBtn: HTMLElement = rendered('img', buttonsWrapper, 'card__btn_open-card', '', {
      src: 'assets/icons/button-open-card.svg',
      id: `${this.id}`,
    });
    productPageBtn.addEventListener('click', this.productPageBtnCallback);
    // проверяем local storage, добавлена ли этот товар в корзину
    if (this.storageInfo !== null) {
      const posters: PosterStorageType[] = this.storageInfo.slice();
      for (let i: number = 0; i < posters.length; i += 1) {
        if (posters[i].id === this.id) {
          this.totalPrice = posters[i].quantity * this.price;
          console.log('🚀 ~ file: card.ts:82 ~ Card ~ render ~ this.totalPrice', this.totalPrice);
          this.itemQuantity = posters[i].quantity;
          console.log('🚀 ~ file: card.ts:84 ~ Card ~ render ~ this.itemQuantity', this.itemQuantity);
          this.element.classList.add('added');
          this.wasAdded = true;
        }
      }
    }
    // подбираем нужную картинку для кнопки, в завимимости от того, есть ли карточка в корзине
    let imgSource: string;
    if (this.element.classList.contains('added')) {
      imgSource = 'assets/icons/button-close.svg';
    } else {
      imgSource = 'assets/icons/button-buy.svg';
    }
    this.buyButton = rendered('img', buttonsWrapper, 'card__btn_buy', '', {
      src: `${imgSource}`,
    });
    // вешаем слушатель на кнопку
    this.buyButton.addEventListener('click', this.buyBtnCallback);
  }

  // колбэк для рутинга
  private productPageBtnCallback = (e: Event): void => {
    e.preventDefault();
    window.history.pushState({}, '', `${this.id}`);
    this.callback(e);
  };

  private buyBtnCallback = (): void => {
    if (!this.element.classList.contains('added')) {
      this.element.classList.add('added');
      this.buyButton?.setAttribute('src', 'assets/icons/button-close.svg');
      this.notifyObserver();
    } else {
      this.element.classList.remove('added');
      this.buyButton?.setAttribute('src', 'assets/icons/button-buy.svg');
      this.notifyObserver();
      if (this.wasAdded === true) {
        this.wasAdded = false;
        this.totalPrice = 0;
        this.itemQuantity = 0;
      }
    }
  };

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
