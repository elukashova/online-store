import rendered from '../../utils/render';
import { CardDataInfo, Observer } from '../card/card.types';
import BaseComponent from '../base-component/base-component';
import { checkDataInLocalStorage } from '../../utils/localStorage';
import { PosterStorageInfo } from '../../utils/localStorage.types';
import { Callback } from './shopping-cart.types';
import Routes from '../app/routes.types';

export default class CartCard extends BaseComponent {
  private addedItems: PosterStorageInfo[] | null = [];

  public id: number;

  public title: string;

  public category: string;

  public size: string;

  public rating: number;

  public images: string[];

  public description: string;

  public stock: number;

  public price: number;

  public totalPrice: number = 0;

  public discount: number;

  public minusBtn: HTMLElement | null = null;

  public plusBtn: HTMLElement | null = null;

  public priceForItemElement: HTMLElement | null = null;

  public itemAmountElement: HTMLElement | null = null;

  private observers: Observer[] = [];

  public itemAmount: number = 0;

  public itemInfo: PosterStorageInfo | undefined = undefined;

  // эти два указателя мне нужны для обсервера на клик на + и -
  public minus: boolean = false;

  public plus: boolean = false;

  // eslint-disable-next-line max-len
  constructor(private data: CardDataInfo, private itemOrder: number, private callback: Callback) {
    super('div', 'cart-items__item cart-item');
    this.id = this.data.id;
    this.title = this.data.title;
    this.category = this.data.category;
    this.rating = this.data.rating;
    this.size = this.data.size;
    this.images = this.data.images.slice();
    this.description = this.data.description;
    this.stock = this.data.stock;
    this.price = this.data.price;
    this.discount = this.data.discountPercentage;
    const storageInfo: PosterStorageInfo[] | null = <PosterStorageInfo[]>checkDataInLocalStorage('addedPosters');
    if (storageInfo !== null) {
      this.addedItems = storageInfo.slice();
      this.itemInfo = this.addedItems.find((item: PosterStorageInfo) => item.id === this.id);
      if (this.itemInfo) {
        this.itemAmount = this.itemInfo.quantity;
      }
      this.totalPrice = this.itemAmount * this.price;
    }
    this.render();
  }

  // eslint-disable-next-line max-lines-per-function
  public render(): void {
    // правая карточка
    const itemCard = rendered('div', this.element, 'cart-item__card', '', {
      id: `crd${this.id}`,
    });
    itemCard.addEventListener('click', this.productPageCallback);
    rendered('span', itemCard, 'cart-item__order', `${this.itemOrder}`);
    rendered('img', itemCard, 'cart-item__img', '', {
      src: this.images[0],
      alt: 'poster image',
    });
    const firstItemDescr: HTMLElement = rendered('div', itemCard, 'cart-item__description');
    this.fillCardInfo(firstItemDescr);

    // правая часть с возможностью поменять количество
    const amountContainer = rendered('div', this.element, 'cart-item__amount_container');
    const itemAmountContainer: HTMLElement = rendered('div', amountContainer, 'cart-amount__change-container');
    const changeAmountContainer: HTMLElement = rendered('div', itemAmountContainer, 'cart-amount__change-container');
    this.minusBtn = rendered('img', changeAmountContainer, 'cart-amount__btn-minus', '', {
      src: 'assets/icons/cart-btn__minus.svg',
      alt: 'reduce the number of posters',
    });
    this.minusBtn.addEventListener('click', this.minusBtnCallback);
    this.itemAmountElement = rendered('span', changeAmountContainer, 'cart-amount__amount', `${this.itemAmount}`);
    this.plusBtn = rendered('img', changeAmountContainer, 'cart-amount__btn-plus', '', {
      src: 'assets/icons/cart-btn__plus.svg',
      alt: ' increase the number of posters',
    });
    this.plusBtn.addEventListener('click', this.plusBtnCallback);
    const stockAmountContainer: HTMLElement = rendered('div', amountContainer, 'cart-amount__stock-container');
    rendered('span', stockAmountContainer, 'cart-amount__stock-text', 'Stock:');
    rendered('span', stockAmountContainer, 'cart-amount__stock-num', `${this.stock}`);

    const itemPriceContainer: HTMLElement = rendered('div', amountContainer, 'cart-amount__price-container');
    rendered('span', itemPriceContainer, 'cart-amount__price-text', '$');
    this.priceForItemElement = rendered(
      'span',
      itemPriceContainer,
      'cart-amount__price-num',
      `${this.totalPrice.toLocaleString('en-US')}`,
    );
  }

  private fillCardInfo(cardInfoWrapper: HTMLElement): void {
    const fields = [
      { label: 'Title', value: this.title },
      { label: 'Category', value: this.category },
      { label: 'Size', value: `Size ${this.size}` },
      { label: 'Rating', value: `Rating: ${this.rating}` },
      { label: 'Price', value: `Price: $ ${this.price}` },
      { label: 'Discount', value: `Discount: ${this.discount}` },
      { label: 'Text', value: this.description },
    ];

    fields.forEach((field) => {
      rendered('span', cardInfoWrapper, `cart-item__description_${field.label.toLowerCase()}`, `${field.value}`);
    });
  }

  private productPageCallback = (): void => {
    window.history.pushState({}, '', `${Routes.Product}/${this.id}`);
    this.callback();
  };

  public minusBtnCallback = (): void => {
    this.minus = true;
    this.plus = false;
    if (this.itemAmount > 0) {
      this.totalPrice -= this.price;
      this.itemAmount -= 1;
      if (this.priceForItemElement && this.itemAmountElement) {
        this.priceForItemElement.textContent = `${this.totalPrice.toLocaleString('en-US')}`;
        this.itemAmountElement.textContent = `${this.itemAmount}`;
      }
      this.notifyObserver();
      if (this.plusBtn && this.plusBtn.classList.contains('disabled')) {
        this.plusBtn.classList.remove('disabled');
      }
    }
  };

  private plusBtnCallback = (e: Event): void => {
    this.plus = true;
    this.minus = false;
    // невозможность добавить больше, чем есть на стоке
    if (this.itemAmount < this.stock) {
      this.totalPrice += this.price;
      this.itemAmount += 1;
      if (this.priceForItemElement && this.itemAmountElement) {
        this.priceForItemElement.textContent = `${this.totalPrice.toLocaleString('en-US')}`;
        this.itemAmountElement.textContent = `${this.itemAmount}`;
      }
      this.notifyObserver();
      if (this.itemAmount === this.stock && e.target instanceof HTMLElement) {
        this.plusBtn?.classList.add('disabled');
      }
    }
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
