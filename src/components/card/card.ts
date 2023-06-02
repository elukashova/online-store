import './card.styles.css';
import rendered from '../../utils/render';
import { CardDataInfo, Observer } from './card.types';
import BaseComponent from '../base-component/base-component';
import { checkDataInLocalStorage } from '../../utils/localStorage';
import { PosterStorageInfo } from '../../utils/localStorage.types';
import { Callback } from '../shopping-cart/shopping-cart.types';

export default class Card extends BaseComponent {
  public products: CardDataInfo;

  public buyButton: HTMLElement | null = null;

  public itemPrice: number = 0;

  public itemQuantity: number = 0;

  public totalPrice: number = 0;

  private observers: Observer[] = [];

  private wasAdded: boolean = false;

  private readonly storageInfo: PosterStorageInfo[] | null = checkDataInLocalStorage('addedPosters');

  constructor(product: CardDataInfo, private callback: Callback) {
    super('div', 'cards__item card');
    this.products = product;
    this.render();
  }

  // eslint-disable-next-line max-lines-per-function
  public render(): void {
    this.element.classList.add(`${this.products.category}`);
    const cardImg: HTMLElement = rendered('figure', this.element, 'card__img-holder');
    rendered('img', cardImg, 'card__img', '', {
      src: this.products.images[0],
      id: `img${this.products.id}`,
      alt: 'photo of poster',
    });
    cardImg.addEventListener('click', this.productPageBtnCallback);
    const cardInfo: HTMLElement = rendered('div', this.element, 'card__info');
    const cardInfoWrapper: HTMLElement = rendered('div', cardInfo, 'card__info_wrapper');
    rendered('p', cardInfoWrapper, 'card__name', `${this.products.title}`);
    rendered('p', cardInfoWrapper, 'card__category', `${this.products.category}`);
    rendered('p', cardInfoWrapper, 'card__size', `Size: ${this.products.size}`);
    rendered('p', cardInfoWrapper, 'card__stock', `Stock: ${this.products.stock}`);
    rendered('p', cardInfoWrapper, 'card__rating', `Rating: ${this.products.rating}`);
    rendered('p', cardInfoWrapper, 'card__price', `$ ${this.products.price}`);
    rendered('p', cardInfoWrapper, 'card__description', `${this.products.description.split('.')[0]}`);
    const discountAndBtnsWrapper: HTMLElement = rendered('div', cardInfo, 'card__discount-btns-wrapper');
    rendered('p', discountAndBtnsWrapper, 'card__discount', `Sale: ${this.products.discountPercentage}%`);
    const buttonsWrapper: HTMLElement = rendered('div', discountAndBtnsWrapper, 'card__btns');
    const productPageBtn: HTMLElement = rendered('img', buttonsWrapper, 'card__btn_open-card', '', {
      src: 'assets/icons/button-open-card.svg',
      id: `${this.products.id}`,
      alt: 'open product info',
    });
    productPageBtn.addEventListener('click', this.productPageBtnCallback);
    // проверяем local storage, добавлена ли этот товар в корзину
    if (this.storageInfo !== null) {
      const posters: PosterStorageInfo[] = this.storageInfo.slice();
      for (let i: number = 0; i < posters.length; i += 1) {
        if (posters[i].id === this.products.id) {
          this.totalPrice = posters[i].quantity * this.products.price;
          this.itemQuantity = posters[i].quantity;
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
      alt: 'add to cart',
    });
    // вешаем слушатель на кнопку
    this.buyButton.addEventListener('click', this.buyBtnCallback);
  }

  // колбэк для рутинга
  private productPageBtnCallback = (e: Event): void => {
    e.preventDefault();
    window.history.pushState({}, '', `product/${this.products.id}`);
    this.callback(e);
    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });
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
    this.observers.push(observer);
  }

  public removeObserver(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      console.log('Subject: Nonexistent observer.');
    }

    this.observers.splice(observerIndex, 1);
  }

  public notifyObserver(): void {
    for (let i: number = 0; i < this.observers.length; i += 1) {
      this.observers[i].update(this);
    }
  }
}
