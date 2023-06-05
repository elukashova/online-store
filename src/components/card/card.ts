import './card.styles.css';
import rendered from '../../utils/render';
import { CardDataInfo, Observer } from './card.types';
import BaseComponent from '../base-component/base-component';
import { checkDataInLocalStorage } from '../../utils/localStorage';
import { PosterStorageInfo } from '../../utils/localStorage.types';
import { Callback } from '../shopping-cart/shopping-cart.types';
import Routes from '../app/routes.types';

export default class Card extends BaseComponent {
  public products: CardDataInfo;

  public buyButton: HTMLElement | null = null;

  public itemPrice: number = 0;

  public itemQuantityInCart: number = 0;

  public totalPriceInCart: number = 0;

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
    this.fillCardInfoWrapper(cardInfoWrapper);
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
      for (let i: number = 0; i < this.storageInfo.length; i += 1) {
        if (this.storageInfo[i].id === this.products.id) {
          this.totalPriceInCart = this.storageInfo[i].quantity * this.products.price;
          this.itemQuantityInCart = this.storageInfo[i].quantity;
          this.element.classList.add('added');
          this.wasAdded = true;
        }
      }
    }
    // подбираем нужную картинку для кнопки, в завимимости от того, есть ли карточка в корзине
    const imgSource: string = this.wasAdded ? 'assets/icons/button-close.svg' : 'assets/icons/button-buy.svg';
    this.buyButton = rendered('img', buttonsWrapper, 'card__btn_buy', '', {
      src: `${imgSource}`,
      alt: 'add to cart',
    });
    // вешаем слушатель на кнопку
    this.buyButton.addEventListener('click', this.buyBtnCallback);
  }

  private fillCardInfoWrapper(cardInfoWrapper: HTMLElement): void {
    const fields = [
      { label: 'Name', value: this.products.title },
      { label: 'Category', value: this.products.category },
      { label: 'Size', value: this.products.size },
      { label: 'Stock', value: this.products.stock },
      { label: 'Rating', value: this.products.rating },
      { label: 'Price', value: `$ ${this.products.price}` },
      { label: 'Description', value: this.products.description.split('.')[0] },
    ];

    fields.forEach((field) => {
      rendered('p', cardInfoWrapper, `card__${field.label.toLowerCase()}`, `${field.label}: ${field.value}`);
    });
  }

  // колбэк для рутинга
  private productPageBtnCallback = (): void => {
    window.history.pushState({}, '', `${Routes.Product}/${this.products.id}`);
    this.callback();
    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  };

  private buyBtnCallback = (): void => {
    if (!this.wasAdded) {
      this.element.classList.add('added');
      this.buyButton?.setAttribute('src', 'assets/icons/button-close.svg');
    } else {
      this.element.classList.remove('added');
      this.buyButton?.setAttribute('src', 'assets/icons/button-buy.svg');
      this.wasAdded = false;
      this.totalPriceInCart = 0;
      this.itemQuantityInCart = 0;
    }
    this.notifyObserver();
  };

  // три метода, нужные для обсервера
  public attachObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  public removeObserver(observer: Observer): void {
    const observerIndex: number = this.observers.indexOf(observer);
    this.observers.splice(observerIndex, 1);
  }

  public notifyObserver(): void {
    for (let i: number = 0; i < this.observers.length; i += 1) {
      this.observers[i].update(this);
    }
  }
}
